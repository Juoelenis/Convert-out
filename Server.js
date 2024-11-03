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

