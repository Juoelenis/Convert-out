// server.js
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');


const app = express();
const upload = multer({ dest: 'uploads/' });


// Endpoint to handle file upload and conversion
app.post('/convert', upload.single('audio'), (req, res) => {
  const inputFilePath = req.file.path;
  const outputFilePath = `uploads/${Date.now()}.wma`;


  ffmpeg(inputFilePath)
    .toFormat('wma')
    .on('end', () => {
      res.download(outputFilePath, 'converted.wma', (err) => {
        if (err) console.error(err);
        fs.unlinkSync(inputFilePath); // delete the original file
        fs.unlinkSync(outputFilePath); // delete the converted file after download
      });
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Conversion failed');
    })
    .save(outputFilePath);
});


app.listen(3000, () => console.log('Server started on http://localhost:3000'));

// server.js
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const mime = require('mime-types');

const app = express();
const upload = multer({ dest: 'uploads/' });
const wss = new WebSocket.Server({ port: 8080 });

// WebSocket connection for progress updates
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  ws.on('close', () => console.log('WebSocket connection closed'));
});

// Utility to send progress updates
function sendProgressUpdate(progress) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ progress }));
    }
  });
}

// Endpoint for converting audio files
app.post('/convert', upload.single('audio'), (req, res) => {
  const inputFilePath = req.file.path;
  const outputFormat = req.body.format || 'wma';
  const outputFilePath = `uploads/${Date.now()}.${outputFormat}`;
  const fileSizeLimit = 50 * 1024 * 1024; // 50 MB file size limit

  // Check MIME type for security
  if (mime.lookup(req.file.originalname) !== 'audio/mpeg') {
    return res.status(400).send('Only MP3 files are allowed');
  }

  // Check file size
  if (req.file.size > fileSizeLimit) {
    fs.unlinkSync(inputFilePath); // clean up
    return res.status(400).send('File size exceeds limit (50 MB)');
  }

  // FFmpeg command with progress updates
  ffmpeg(inputFilePath)
    .toFormat(outputFormat)
    .on('progress', (progress) => {
      const percent = Math.floor(progress.percent || 0);
      sendProgressUpdate(percent); // Send progress over WebSocket
    })
    .on('end', () => {
      res.download(outputFilePath, `converted.${outputFormat}`, (err) => {
        if (err) console.error(err);
        fs.unlinkSync(inputFilePath); // delete original
        fs.unlinkSync(outputFilePath); // delete converted
      });
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Conversion failed');
    })
    .save(outputFilePath);
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
