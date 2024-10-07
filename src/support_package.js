// This modules exposes some functions that can be used to:
// - Decompress a support package tar.gz file
// - Decode the SupportPackage.txt file
// - Concatenate the Wiser Home logs
// - Decode the Wiser Home logs
// - Create a log structure

// import file system library - for file operations
const fs = require('fs');
const { open } = fs.promises;
const path = require('path');

// import decompression library - for decompressing tar.gz files
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const gunzip = require('gunzip-file');
const { DecodeLocalLogs } = require('./read_container_logs');

// import the severity module - for mapping between syslog severity levels and their corresponding numeric values
const severityAPI = require('./severity');

// The Support Package Database - a global object that will store all logs in a searchable format
var spdb = {
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

// expose to the module a decompression function
async function DecompressSupportPackage(source_path, destination_dir) 
{
   // ensure that the destination directory exists
   if (!fs.existsSync(destination_dir))
   {
      fs.mkdirSync(destination_dir, { recursive: true });
   }

   try 
   {
      const result = await decompress(source_path, destination_dir, {
         plugins: [
             decompressTargz()
         ]
      });

      if (result.length === 0)
      {
         throw new Error('No files were decompressed');
      }
      console.log('Files decompressed, attempting to decode SupportPackage.txt');
   }
   catch (err)
   {
      console.log('Files could not be decompressed, this may be an old RTOS support package. Attempting to decode it as if it were SupportPackage.txt');
      fs.copyFileSync(source_path, path.join(destination_dir, 'SupportPackage.txt'));
   }
}
 
function DecodeSupportPackageTxt(inputFilePath, destinationFolder)
{
   // if the SupportPackage.txt file does not exist, return
   if (!fs.existsSync(inputFilePath))
   {
      console.log('SupportPackage.txt file not found');
      return;
   }

   const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
   
   // Split the content into sections
   const sections = fileContent.split('----');
   
   const expectedSections = [
      { name: 'DB contents:', destinaton: 'datamodel.json' },
      { name: 'Contents of file system:', destinaton: 'FileSystemContents.txt' },
      { name: 'Reset Reasons', destinaton: 'ResetReasons.txt' },
      { name: 'Journal Log', destinaton: 'logs/journal.log' }
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
            const destinaton = path.join(destinationFolder, expectedSection.destinaton);
            // make sure the folder exists
            if (!fs.existsSync(path.dirname(destinaton)))
            {
               fs.mkdirSync(path.dirname(destinaton), { recursive: true });
            }

            // If this is the DB contents section, save it as a JSON file in pretty format
            if (sectionName === 'DB contents:')
            {
               const dbContents = JSON.parse(sectionContents);
               const prettyDbContents = JSON.stringify(dbContents, null, 3);
               fs.writeFileSync(path.join(destinationFolder, expectedSection.destinaton), prettyDbContents);
            }
            else
            {
               fs.writeFileSync(path.join(destinationFolder, expectedSection.destinaton), sectionContents);
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
      fs.writeFileSync(path.join(destinationFolder, "datamodel.json"), prettySupportPackageData);
   }

   // remove the SupportPackage.txt file
   fs.rmSync(inputFilePath);

   console.log('Sections have been successfully written to separate files.');
}

function ConcatenateOldWiserHomeLogs(logsFolder, fullLogsWritePath)
{
   // If file does not exist, create it
   if (!fs.existsSync(fullLogsWritePath))
   {
      // make sure the logs folder exists
      if (!fs.existsSync(path.dirname(fullLogsWritePath)))
      {
         fs.mkdirSync(path.dirname(fullLogsWritePath), { recursive: true });
      }
      fs.writeFileSync(fullLogsWritePath, '');      
   }

   // Look for all files of the form wiser-homeN.txt where N is a number from 8 to 1
   for (let i = 8; i >= 0; i--)
   {
      let logFileName = 'wiser-home.' + i + '.txt';

      if (i == 0)
      {
         logFileName = 'wiser-home.txt';
      }

      // if log file exists, copy it to fullLogsWritePath
      if (fs.existsSync(path.join(logsFolder, logFileName)))
      {
         const logFileContents = fs.readFileSync(path.join(logsFolder, logFileName), 'utf-8');
         fs.appendFileSync(fullLogsWritePath, logFileContents);
         // delete the log file
         fs.unlinkSync(path.join(logsFolder, logFileName));
      }
   }
}

async function ConcatenateContainerLocalLogs(logFolder, fullLogsWritePath)
{
   // The name of the container is the basename of the folder
   const containerName = path.basename(logFolder);

   const fullLogsWritePathBinary = fullLogsWritePath + '.bin';

   // ensure we empty the file first
   fs.writeFileSync(fullLogsWritePathBinary, '');

   // There may be multiple log files in the container folder of the form: container.log.1.gz, container.log.2.gz, etc.
   // We need to decompress these files and concatenate them into a single file
   // They should be in the format of a protobuf message of type LogEntry
   // They should be concatenated in order of their sequence number, startng with the oldest which will be the highest number
   const compressedLogFiles = fs.readdirSync(logFolder).filter(fn => fn.endsWith('.gz'));

   // sort the files by their sequence number - highest first
   compressedLogFiles.sort((a, b) => parseInt(b.split('.')[2]) - parseInt(a.split('.')[2]));
   
   for (let j = 0; j < compressedLogFiles.length; j++)
   {
      const logFileGz = path.join(logFolder, compressedLogFiles[j]);
      const logFile = path.join(logFolder, compressedLogFiles[j].replace('.gz', ''));

      await new Promise((resolve, reject) => {
         gunzip(logFileGz, logFile, () => { 
            fs.unlinkSync(logFileGz);
            resolve();  
         });
       });

      fs.appendFileSync(fullLogsWritePathBinary, fs.readFileSync(logFile));
      
      // delete the log file
      fs.unlinkSync(logFile);
   }

   // There should be one more file called container.log which is the current log file and is not compressed
   const currentLogFile = path.join(logFolder, 'container.log');
   if (fs.existsSync(currentLogFile))
   {
      fs.appendFileSync(fullLogsWritePathBinary, fs.readFileSync(currentLogFile));
      // delete the log file
      fs.unlinkSync(currentLogFile);
   }

   // now that we have concatenated the binary log files, we need to convert them to text
   DecodeLocalLogs(fullLogsWritePathBinary, fullLogsWritePath);

   // delete the binary log file
   fs.unlinkSync(fullLogsWritePathBinary);
   // remove the log folder
   fs.rmdirSync(logFolder);
}

function ConcatenateAllLocalLogs(destinationFolder)
{
   // We look for all folders insize the ./logs folder inside the support package
   const logsFolder = path.join(destinationFolder, 'logs');
   if (!fs.existsSync(logsFolder))
   {
      console.log('No logs folder found in support package');
      return;
   }

   const logFolders = fs.readdirSync(logsFolder).filter(fn => fs.lstatSync(path.join(logsFolder, fn)).isDirectory());
   
   // for each folder, call ConcatenateContainerLocalLogs
   for (let i = 0; i < logFolders.length; i++)
   {
      const logFolder = path.join(logsFolder, logFolders[i]);
      const fullLogsWritePath = path.join(destinationFolder, "logs", logFolders[i] + '.log');
      ConcatenateContainerLocalLogs(logFolder, fullLogsWritePath);
   }

}

function decodeWiserHomeLogEntry(file, line)
{
   // [2024-07-16 20:44:38.339] [zigbee    ] [notice    ] Some message text

   let entry = { 
      unixtimestamp: 0,
      file: file,
      severity: severityAPI.getSeverityDefaultValue(),
      component: "",
      message: line, // we should faithfully preserve the whole line here
   };

   timestamp = line.substring(1, line.indexOf(']'));
   // convert the timestamp to a unix timestamp
   entry.unixtimestamp = new Date(timestamp).getTime();      
   line = line.substring(line.indexOf(']') + 1).trim();

   // extract the component
   const componentEnd = line.indexOf(']');
   entry.component = line.substring(1, componentEnd).trim();

   // extract the severity
   const severityStart = line.indexOf('[', componentEnd + 1);
   const severityEnd = line.indexOf(']', severityStart);
   entry.severity = severityAPI.getSeverityValueOrDefault(line.substring(severityStart + 1, severityEnd).trim());

   return entry;
}

function decodeJournalLogEntry(file, line)
{
   // Extract the timestamp
   let entry = { 
      unixtimestamp: 0,
      file: file,
      severity: severityAPI.getSeverityDefaultValue(),
      component: "",
      message: line, // we should faithfully preserve the whole line here
   };

   // This is a journal log entry of the form:
   // Oct 02 07:00:54 WiserHeat05C2D7 component[id]: message text

   timestamp = line.substring(0, 15);
   // as the timestamp in Journal logs does not contain the timezone, we need to add it
   timestamp += 'Z';
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
   line = line.substring(16).trim();

   // remove the prefix of the form WiserHeat05C2D7
   line = line.substring(line.indexOf(' ')).trim();

   // extract the component
   const componentEnd = line.indexOf(':');
   entry.component = line.substring(0, componentEnd);
   // Note: Journal components sometimes have a suffix of [id] which we should remove
   const idStart = entry.component.indexOf('[');
   if (idStart !== -1)
   {
      entry.component = entry.component.substring(0, idStart).trim();
   }

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
      severity: severityAPI.getSeverityDefaultValue(),
      component: "unknown",
      message: line,
   };
}

async function IngestTextualLogFileToDB(filename)
{
   const file = await open(filename);
   // The shortFilename should be the name of the file without the path or the suffix
   const shortFilename = path.basename(filename, '.log');
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
         spdb.entries.push(entry);
         // set the default timestamp to the last entry
         // if the next entry cannot determine its timestamp, we will use this one
         default_timestamp = entry.unixtimestamp; 
      }
   }

   file.close();   
}

async function CreateLogDB(destinationFolder)
{
   const logFiles = fs.readdirSync(destinationFolder).filter(fn => fn.endsWith('.log'));

   // Read all log files and create a log structure
   for (let i = 0; i < logFiles.length; i++)
   {
      await IngestTextualLogFileToDB(path.join(destinationFolder, logFiles[i]));
   }

   console.log('Sorting log entries by timestamp... this may take a while: we have ', spdb.entries.length, ' entries');
   // capture the time before and after the sort to see how long it takes
   let start = new Date();
   // Sort the log entries by timestamp
   spdb.entries.sort((a, b) => a.unixtimestamp - b.unixtimestamp);

   let end = new Date();
   console.log('Log entries have been sorted by timestamp. This took: ', end - start, ' milliseconds');

   console.log('Creating searchable log maps...');
   start = new Date();
   // Create the component, severity, and file maps
   for (let i = 0; i < spdb.entries.length; i++)
   {
      const entry = spdb.entries[i];
      if (spdb.components[entry.component] === undefined)
      {
         spdb.components[entry.component] = new Set();
      }
      spdb.components[entry.component].add(i);

      if (spdb.severity[entry.severity] === undefined)
      {
         spdb.severity[entry.severity] = new Set();
      }
      spdb.severity[entry.severity].add(i);

      if (spdb.files[entry.file] === undefined)
      {
         spdb.files[entry.file] = new Set();
      }
      spdb.files[entry.file].add(i);
   }   
   end = new Date();
   console.log('Searchable log maps have been created. This took: ', end - start, ' milliseconds');
}

// This function will perform the following actions:
// - decompress the support package (it will auto-detect if it is an old style RTOS support package and NOT decompress it) 
// - decode the SupportPackage.txt file
// - concatenate any old-style Wiser Home logs (the ones created by spdlog)
// - explore the decompressed folder and extract any docker local logs folders it finds (new style logs from multi-container support packages)
// - create a log structure from the logs and store this in spdb for later use in the API
//
// @param source_file - the full path to the source file which should be a tar.gz file downloaded from the Wiser One Portal
// @param destination_dir - the full path to the destination directory where the decompressed files will be stored
async function PostProcessSupportPackage(source_file, destination_dir)
{
   try 
   {
      // first of all clear the destination directory
      if (fs.existsSync(destination_dir))
      {
         fs.rmSync(destination_dir, { recursive: true });
      }
   
      await DecompressSupportPackage(source_file, destination_dir);
      
      console.log('Support package has been decompressed, attempting to process it');
      
      DecodeSupportPackageTxt(path.join(destination_dir, 'SupportPackage.txt'), destination_dir);
   
      console.log('Attempting to concatenate old Wiser Home logs');
      ConcatenateOldWiserHomeLogs(path.join(destination_dir, "log"), path.join(destination_dir, 'logs', 'wiser-home.log'));
   
      console.log('Attempting process any container local logs found in the support package');
      ConcatenateAllLocalLogs(destination_dir);
   
      console.log('Attempting to create a log structure from the logs');
      CreateLogDB(destination_dir);

      // remove the log folder
      fs.rmSync(path.join(destination_dir, 'log'), { recursive: true });
   }
   catch (err)
   {
      console.log('Error processing support package: ', err);
   }
}

// export functions for use in app.js
module.exports = {
   PostProcessSupportPackage,
   spdb
};


