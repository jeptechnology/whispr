const decompress = require('decompress');
const decompressTargz = require('decompress-targz');

const express = require('express');
const webserver = express();
const port = 3000;

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

webserver.use(express.json());
webserver.use(express.static('public'));

webserver.post('/upload', upload.single('support_package'), function (req, res, next) {
   // req.file is the `avatar` file
   // req.body will hold the text fields, if there were any
   console.log("Attempting to untar: ", req.file.path);

   decompress(req.file.path, 'public/package', {
      plugins: [
          decompressTargz()
      ]
   }).then(() => {
         console.log('Files decompressed');
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
