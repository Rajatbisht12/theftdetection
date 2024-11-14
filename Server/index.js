require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: './uploads/' });
const fs = require('fs');
const path = require('path');

const cloudinary = require('cloudinary').v2;

const app = express();

app.use(cors());
app.use(express.json());

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function sendWhatsAppMessage(imageUrl) {
  try {
    const message = await client.messages.create({
      body: `Unknown stranger detected. View image: ${imageUrl}`,
      from: 'whatsapp:+14155238886',  
      to: 'whatsapp:+919818270753',  
      // mediaUrl: [imageUrl]

    });
    console.log('Message sent successfully. SID:', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'No image URL provided' });
    }
    console.log('Image URL:', imageUrl);
    
    const message = await sendWhatsAppMessage(imageUrl);
    
    res.status(200).json({ success: true, message: 'WhatsApp message sent successfully!', sid: message.sid });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post('/api/upload-image', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log('Uploaded file:', file);

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp','image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'detected_persons',
      unique_filename: true,
      use_filename: true,
      resource_type: 'auto', 
    });
    
    console.log('Cloudinary upload result:', result);


    fs.unlinkSync(file.path);

    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);

    // // Check if the error is from Cloudinary
    // if (error.http_code) {
    //   return res.status(error.http_code).json({ 
    //     success: false, 
    //     error: error.message,
    //     details: error
    //   });
    // }

    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));