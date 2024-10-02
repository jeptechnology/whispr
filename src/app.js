// import express library - for web server
const express = require('express');
const webserver = express();
const port = 3000;

// import multer library - for file uploads
const multer = require('multer');
const upload = multer({ dest: __dirname + '/uploads/' });

// import decompression library - for decompressing tar.gz files
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');

// import file system library - for file operations
const fs = require('fs');

webserver.use(express.json());
webserver.use(express.static(__dirname + '/public'));
webserver.use(express.static(__dirname + '/support_package'));

webserver.post('/upload', upload.single('support_package'), function (req, res, next) {
   // req.file is the `avatar` file
   // req.body will hold the text fields, if there were any
   console.log("Attempting to untar: ", req.file.path);

   decompress(req.file.path, __dirname + '/support_package', {
      plugins: [
          decompressTargz()
      ]
   }).then(() => {
         console.log('Files decompressed');
         fs.rm(req.file.path);
         res.json({ message: 'File uploaded successfully!' });
   });
  
 })
 
webserver.listen(port, () => {
   console.log(`Server is running on port ${port}`);
   });

webserver.get('/api', (req, res) => {
   res.json({ message: 'Hello, world!' });
   });

webserver.post('/api', (req, res) => {
   console.log(req.body);
   res.json({ message: 'Post request received!' });
   });

// export webserver for use in app.js
module.exports = webserver;