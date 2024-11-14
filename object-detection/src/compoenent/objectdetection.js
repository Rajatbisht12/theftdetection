import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import axios from 'axios';

let detectInterval;

const ObjectDetection = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastAlertTime, setLastAlertTime] = useState(0);
  const alertCooldown = 60000; // 1 minute cooldown

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  async function runCoco() {
    setIsLoading(true);
    const net = await cocoSSDLoad();
    setIsLoading(false);

    detectInterval = setInterval(() => {
      runObjectDetection(net);
    }, 10);
  }

  async function runObjectDetection(net) {
    if (
      canvasRef.current &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const detectedObjects = await net.detect(
        webcamRef.current.video,
        undefined,
        0.6
      );

      const context = canvasRef.current.getContext("2d");
      renderPredictions(detectedObjects, context);
    }
  }

  const showmyVideo = () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoWidth = webcamRef.current.video.videoWidth;
      const myVideoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = myVideoWidth;
      webcamRef.current.video.height = myVideoHeight;
    }
  };

  useEffect(() => {
    runCoco();
    showmyVideo();
  }, []);

  const sendWhatsAppAlert = async (imageUrl) => {
    const currentTime = Date.now();
    if (currentTime - lastAlertTime < alertCooldown) {
      return;
    }
  
    setLastAlertTime(currentTime);

    try {
      const response = await axios.post('http://localhost:5000/api/send-whatsapp', { imageUrl }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('WhatsApp alert sent:', response.data);
    } catch (error) {
      console.error('Error sending WhatsApp alert:', error);
    }
  };

  

  let whatsappAlertSent = false;

  const renderPredictions = (predictions, ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
  
    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction["bbox"];
  
      const isPerson = prediction.class === "person";
  
      ctx.strokeStyle = isPerson ? "#FF0000" : "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
  
      ctx.fillStyle = `rgba(255, 0, 0, ${isPerson ? 0.2 : 0})`;
      ctx.fillRect(x, y, width, height);
  
      ctx.fillStyle = isPerson ? "#FF0000" : "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10);
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
  
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
  
      if (isPerson && !whatsappAlertSent) {
        playAudio();
        captureImage();
        whatsappAlertSent = true;
      }
    });
  };

  const captureImage = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        console.error('Failed to capture image');
        return;
      }
      console.log('Image captured successfully');
      setCapturedImage(imageSrc);
  
      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      console.log('Blob created:', blob);
  
      const formData = new FormData();
      formData.append('file', blob, 'captured_image.jpg');
      console.log('FormData created:', formData);
  
      console.log('Sending request to server...');
      console.log('Uploaded file details:', {
        originalname: 'captured_image.jpg',
        mimetype: 'image/jpeg',
        size: blob.size,
      });
  
      const uploadResponse = await axios.post('http://localhost:5000/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response received from server:', uploadResponse);
  
      if (uploadResponse.data && uploadResponse.data.url) {
        const cloudinaryUrl = uploadResponse.data.url;
        console.log('Image uploaded to Cloudinary:', cloudinaryUrl);
        sendWhatsAppAlert(cloudinaryUrl);
      } else {
        console.error('Invalid response from server:', uploadResponse);
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
      }
    }
  };


  const playAudio = () => {
    const audio = new Audio('./police.mp3');
    audio.play();
  };

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">Loading AI Model...</div>
      ) : (
        <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
          <Webcam
            ref={webcamRef}
            src={`http://10.7.1.110/:8080/video`}
            className="rounded-md w-full lg:h-[720px]"
            muted
          />

          {capturedImage && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Captured Person:</h2>
              <img src={capturedImage} alt="Captured person" className="rounded-md" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
          />
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;