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
const path = require('path');

webserver.use(express.json());
webserver.use(express.static(__dirname + '/public'));
webserver.use(express.static(__dirname + '/support_package'));

function decodeSupportPackageTxt()
{
   // Read the input file
   const supportPackagePath = path.join(__dirname, 'support_package');
   const inputFilePath = path.join(supportPackagePath, 'SupportPackage.txt');
   const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
   
   // Split the content into sections
   const sections = fileContent.split('----');
   
   const expectedSections = [
      { name: 'DB contents:', destinaton: 'datamodel.json' },
      { name: 'Contents of file system:', destinaton: 'FileSystemContents.txt' },
      { name: 'Reset Reasons', destinaton: 'ResetReasons.txt' },
      { name: 'Journal Log', destinaton: 'JournalLog.txt' }
   ];

   const expectedDataSections = [
      { name: 'Contents of /status/',    field: 'status' },
      { name: 'Contents of /factory/',   field: 'factory' },
      { name: 'Contents of /domain/',    field: 'domain' },
      { name: 'Contents of /network/',   field: 'network' },
      { name: 'Contents of /schedules/', field: 'schedules' },
      { name: 'Contents of /rus/',       field: 'rus' },
      { name: 'Contents of /debug/',     field: 'debug' },
      { name: 'Contents of /reset/',     field: 'reset' },
      { name: 'Contents of /ocf/',       field: 'ocf' },
      { name: 'Contents of /opentherm/', field: 'opentherm' },
      { name: 'Contents of /migration/', field: 'migration' }      
   ];

   // For each section, identify what it is and then save it to a separate file
   for (let i = 0; i < sections.length; i++)
   {
      const section = sections[i].trim();
      // if this section contains one of our expected sections, save it to a file
      for (let j = 0; j < expectedSections.length; j++)
      {
         const expectedSection = expectedSections[j];
         if (section.includes(expectedSection.name))
         {
            console.log('Found section: ', expectedSection.name);
            const sectionName = expectedSection.name;
            const sectionContents = section.split(sectionName)[1].trim();

            // If this is the DB contents section, save it as a JSON file in pretty format
            if (sectionName === 'DB contents:')
            {
               const dbContents = JSON.parse(sectionContents);
               const prettyDbContents = JSON.stringify(dbContents, null, 3);
               fs.writeFileSync(path.join(supportPackagePath, expectedSection.destinaton), prettyDbContents);
            }
            else
            {
               fs.writeFileSync(path.join(supportPackagePath, expectedSection.destinaton), sectionContents);
            }
         }

      }

      // Check if this section is from an old style RTOS support package.
      // In that case we have to add the section to a global JSON object
      for (let j = 0; j < expectedDataSections.length; j++)
      {
         const expectedSection = expectedDataSections[j];
         if (section.includes(expectedSection.name))
         {
            console.log('Found OLD RTOS data section: ', expectedSection.name);
            const sectionName = expectedSection.name;
            const sectionContents = section.split(sectionName)[1].trim();
            // place this section in the global JSON object
            if (global.supportPackageData === undefined)
            {
               global.supportPackageData = {};
            }
            global.supportPackageData[expectedSection.field] = JSON.parse(sectionContents);
         }
      }      
   }

   // If we have a global JSON object, save it to a file
   if (global.supportPackageData !== undefined)
   {
      const prettySupportPackageData = JSON.stringify(global.supportPackageData, null, 3);
      fs.writeFileSync(path.join(supportPackagePath, "datamodel.json"), prettySupportPackageData);
   }

   console.log('Sections have been successfully written to separate files.');
}


webserver.post('/upload', upload.single('support_package'), function (req, res, next) {
   // req.file is the `avatar` file
   // req.body will hold the text fields, if there were any
   console.log("Attempting to untar: ", req.file.path);

   if (fs.existsSync(__dirname + '/support_package')) {
      fs.rmSync(__dirname + '/support_package', { recursive: true });
      fs.mkdirSync(__dirname + '/support_package');
   }

   decompress(req.file.path, __dirname + '/support_package', {
      plugins: [
          decompressTargz()
      ]
   }).then(() => {
      console.log('Files decompressed, attempting to decode SupportPackage.txt');
      decodeSupportPackageTxt();
      res.json({ message: 'File uploaded successfully!' });
   }).catch((err) => {
      console.log('Files could not be decompressed, this may be an old RTOS support package. Attempting to decode it as if it were SupportPackage.txt');
      fs.copyFileSync(req.file.path, path.join(__dirname, 'support_package', 'SupportPackage.txt'));
      decodeSupportPackageTxt();
      res.json({ message: 'File uploaded successfully!' });
   }).finally(() => {
      console.log('Removing uploaded file from server: ', req.file.path);
      fs.unlinkSync(req.file.path, (err) => {
         if (err) {
            console.error(err);
            return;
         }
      });
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