# Theif Detection  System and WhatsApp Alert System

## Tech Stack

* Frontend: React.js
* Object Detection: TensorFlow.js, COCO-SSD model
* Webcam Access: react-webcam
* Image Upload: Cloudinary
* WhatsApp Alert: Twilio (via Node.js server)
* Server: Node.js, Express.js

## Features

* Real-time object detection using COCO-SSD model
* Captures image when a person is detected
* Uploads image to Cloudinary
* Sends WhatsApp alert with uploaded image URL
* Audio alert when a person is detected

## Getting Started

### Prerequisites

* Node.js installed on your system
* Create a Cloudinary account and obtain an API key
* Create a Twilio account and obtain a WhatsApp sandbox number

### Installation

1. Clone the repository: `git clone https://github.com/vanshchauhan1310/Thief-Detection-Alaram.git`
2. Install dependencies: `npm install`
3. Create a `.env` file with your Cloudinary API key and Twilio WhatsApp sandbox number
4. Start the server: `npm start`

### Usage

1. Open the application in your browser: `http://localhost:3000`
2. Grant access to your webcam
3. The application will detect objects in real-time and capture an image when a person is detected
4. The image will be uploaded to Cloudinary and a WhatsApp alert will be sent with the uploaded image URL

## License

This project is licensed under the MIT License.

## Acknowledgments

* TensorFlow.js for providing the COCO-SSD model
* react-webcam for providing webcam access
* Cloudinary for providing image upload and storage
* Twilio for providing WhatsApp alert functionality

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Author

Vansh Raj Chauhan