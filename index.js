const decompress = require('decompress');
const decompressTargz = require('decompress-targz');

const express = require('express');
const app = express();
const port = 3000;

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

app.post('/upload', upload.single('support_package'), function (req, res, next) {
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
 
app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
   });

app.get('/api', (req, res) => {
   res.json({ message: 'Hello, world!' });
   });

app.post('/api', (req, res) => {
   console.log(req.body);
   res.json({ message: 'Post request received!' });
   });
