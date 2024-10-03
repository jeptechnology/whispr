// import express library - for web server
const express = require('express');
const webserver = express();
const port = 3000;

// import file system library - for file operations
const fs = require('fs');
const path = require('path');
// import the fs/promises library - for file operations
const { open } = fs.promises;

// import multer library - for file uploads
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname,'uploads') });

// import decompression library - for decompressing tar.gz files
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');

// The following global variables are used to store all logs in a searchable format
// They allow us to search for logs by component, severity, and file and produce results to api calls quickly
global.log_structure = {
   // All log entries as objects: { unixtimestamp, log_file, severity, log_entry }
   // These will be sorted by timestamp - which is stored in milliseconds since epoch
   entries : [],
   // All discovered log components as a Map of component -> Set of log entry indeces
   components : {}, 
   // All discovered log severities as a Map of severity -> Set of log entry indeces
   severity : {},
   // All discovered log files as a Map of file -> Set of log entry indeces
   files : {},
};

webserver.use(express.json());
webserver.use(express.static(__dirname + '/public'));
webserver.use(express.static(__dirname + '/support_package'));

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
      postProcessSupportPackage();
      res.json({ message: 'File uploaded successfully!' });
   }).catch((err) => {
      console.log('Files could not be decompressed, this may be an old RTOS support package. Attempting to decode it as if it were SupportPackage.txt');
      fs.copyFileSync(req.file.path, path.join(__dirname, 'support_package', 'SupportPackage.txt'));
      postProcessSupportPackage();
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

// Define the API routes
// GET /api/log?component=component&severity=severity&file=file
webserver.get('/api/log', (req, res) => {
   const component = req.query.component;
   const severity = req.query.severity;
   const file = req.query.file;
      
   // create a set of all possible indeces in the log map - this will be 0..n-1 where n is the number of log entries
   let log_indeces = new Set();
   for (let i = 0; i < global.log_structure.entries.length; i++)
   {
      log_indeces.add(i);
   }

   // if a component is specified, filter the log_indeces to only those that match the component
   if (component !== undefined && global.log_structure.components[component] !== undefined)
   {
      log_indeces = log_indeces.intersection(global.log_structure.components[component]);
   }

   // if a severity is specified, filter the log_indeces to only those that match the severity
   if (severity !== undefined && global.log_structure.severity[severity] !== undefined)
   {
      log_indeces = log_indeces.intersection(global.log_structure.severity[severity]);
   }

   // if a file is specified, filter the log_indeces to only those that match the file
   if (file !== undefined && global.log_structure.files[file] !== undefined)
   {
      log_indeces = log_indeces.intersection(global.log_structure.files[file]);
   }

   // create a string of all log entries that match the filter
   logText = '';
   log_indeces.forEach((index) => {
      logText += global.log_structure.entries[index].message + '\n';
   });

   res.status(200).type('text/plain');
   res.send(logText);

   });

webserver.post('/api', (req, res) => {
   console.log(req.body);
   res.json({ message: 'Post request received!' });
   });

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
      { name: 'Journal Log', destinaton: 'journal.log' }
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

function concatenateWiserHomeLogs()
{
   // The destination file is where we copy all other to:
   const wiserHomeFullLog = path.join(__dirname, 'support_package', 'wiser-home.log');

   // ensure we empty the file first
   fs.writeFileSync(wiserHomeFullLog, '');

   // Read the input file
   const supportPackagePath = path.join(__dirname, 'support_package/log');

   // Look for all files of the form wiser-homeN.txt where N is a number from 8 to 1
   for (let i = 8; i >= 0; i--)
   {
      let logFileName = 'wiser-home.' + i + '.txt';

      if (i == 0)
      {
         logFileName = 'wiser-home.txt';
      }

      // if log file exists, copy it to wiserHomeFullLog
      if (fs.existsSync(path.join(supportPackagePath, logFileName)))
      {
         const logFileContents = fs.readFileSync(path.join(supportPackagePath, logFileName), 'utf-8');
         fs.appendFileSync(wiserHomeFullLog, logFileContents);
         // delete the log file
         fs.unlinkSync(path.join(supportPackagePath, logFileName));
      }
   }
}

function decodeWiserHomeLogEntry(file, line)
{
   // [2024-07-16 20:44:38.339] [zigbee    ] [notice    ] Some message text

   let entry = { 
      unixtimestamp: 0,
      file: file,
      severity: "notice",
      component: "",
      message: "",
   };

   timestamp = line.substring(1, line.indexOf(']'));
   // convert the timestamp to a unix timestamp
   entry.unixtimestamp = new Date(timestamp).getTime();      
   entry.message = line.substring(line.indexOf(']') + 1).trim();

   // extract the component
   const componentEnd = entry.message.indexOf(']');
   entry.component = entry.message.substring(1, componentEnd).trim();

   // extract the severity
   const severityStart = entry.message.indexOf('[', componentEnd + 1);
   const severityEnd = entry.message.indexOf(']', severityStart);
   entry.severity = entry.message.substring(severityStart + 1, severityEnd).trim();

   return entry;
}

function decodeJournalLogEntry(file, line)
{
   // Extract the timestamp
   let entry = { 
      unixtimestamp: 0,
      file: file,
      severity: "notice",
      component: "",
      message: "",
   };

   // This is a journal log entry of the form:
   // Oct 02 07:00:54 WiserHeat05C2D7 component[id]: message text

   timestamp = line.substring(0, 15);
   // convert the timestamp to a unix timestamp
   date = new Date(timestamp);
   
   // if the year is more than 1 years old, then its likely we failed to parse the correct year.
   // In that case, we should use the current year as the year, unless this would put us in the future, in which case we should use the previous year
   if (date.getFullYear() < new Date().getFullYear() - 1)
   {
      date.setFullYear(new Date().getFullYear());
      if (date > new Date())
      {
         date.setFullYear(new Date().getFullYear() - 1);
      }
   }

   entry.unixtimestamp = date.getTime();
   entry.message = line.substring(16).trim();

   // remove the prefix of the form WiserHeat05C2D7
   entry.message = entry.message.substring(entry.message.indexOf(' ')).trim();

   // extract the component
   const componentEnd = entry.message.indexOf(':');
   entry.component = entry.message.substring(0, componentEnd);

   // Cannot extract the severity, so just leave it at "notice"

   return entry;   
}

function createLogEntryFromLine(default_timestamp, file, line)
{
   // If the very first characeter This is a wiser-home log entry of the form:
   // [2024-07-16 20:44:38.339] [zigbee    ] [notice    ] Some message text
   if (line.startsWith('['))
   {
      return decodeWiserHomeLogEntry(file, line);
   }
   // else if the line begins with a letter, then it is an old style journal entry of the form: 
   // Oct 02 07:00:54 WiserHeat05C2D7 component[id]: message text
   else if (line[0].match(/[a-z]/i))
   {
      return decodeJournalLogEntry(file, line);
   }

   // TODO: This is a new style log entry   
   return {
      unixtimestamp: default_timestamp,
      file: file,
      severity: "notice",
      component: "unknown",
      message: line,
   };
}

async function processFile(filename)
{
   const file = await open(filename);
   const shortFilename = path.basename(filename);
   let default_timestamp = 0;
   for await (const line of file.readLines()) 
   {
      // if line is null or empty, skip it
      if (line === null || line.trim() === '')
      {
         continue;
      }

      entry = createLogEntryFromLine(default_timestamp, shortFilename, line);
      if (entry !== null)
      {
         global.log_structure.entries.push(entry);
         // set the default timestamp to the last entry
         // if the next entry cannot determine its timestamp, we will use this one
         default_timestamp = entry.unixtimestamp; 
      }
   }

   file.close();   
}

async function create_log_structure()
{
   const supportPackagePath = path.join(__dirname, 'support_package');
   const logFiles = fs.readdirSync(supportPackagePath).filter(fn => fn.endsWith('.log'));

   // Read all log files and create a log structure
   for (let i = 0; i < logFiles.length; i++)
   {
      await processFile(path.join(supportPackagePath, logFiles[i]));
   }

   console.log('Sorting log entries by timestamp... this may take a while: we have ', global.log_structure.entries.length, ' entries');
   // capture the time before and after the sort to see how long it takes
   let start = new Date();
   // Sort the log entries by timestamp
   global.log_structure.entries.sort((a, b) => a.unixtimestamp - b.unixtimestamp);

   let end = new Date();
   console.log('Log entries have been sorted by timestamp. This took: ', end - start, ' milliseconds');

   console.log('Creating searchable log maps...');
   start = new Date();
   // Create the component, severity, and file maps
   for (let i = 0; i < global.log_structure.entries.length; i++)
   {
      const entry = global.log_structure.entries[i];
      if (global.log_structure.components[entry.component] === undefined)
      {
         global.log_structure.components[entry.component] = new Set();
      }
      global.log_structure.components[entry.component].add(i);

      if (global.log_structure.severity[entry.severity] === undefined)
      {
         global.log_structure.severity[entry.severity] = new Set();
      }
      global.log_structure.severity[entry.severity].add(i);

      if (global.log_structure.files[entry.file] === undefined)
      {
         global.log_structure.files[entry.file] = new Set();
      }
      global.log_structure.files[entry.file].add(i);
   }   
   end = new Date();
   console.log('Searchable log maps have been created. This took: ', end - start, ' milliseconds');
}


function postProcessSupportPackage()
{
   // Concatenate the Wiser Home logs
   concatenateWiserHomeLogs();

   // Decode the SupportPackage.txt file
   decodeSupportPackageTxt();
   
   // Create the log structure
   create_log_structure();
}

// export webserver for use in app.js
module.exports = webserver;

