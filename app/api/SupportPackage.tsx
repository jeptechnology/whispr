'use client';
import { Severity, getSeverityValueOrDefault, getSeverityDefaultValue } from './Severity';
import parseTar from './parseTar';
import { gunzipSync } from 'fflate';
import DecodeLogs from './DecodeLogs';
import { ProcessedLogEntry } from './ProcessedLogEntry';
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

// SupportPackageProps is an interface that defines the props of the SupportPackage component.
// There is a map of filenames and their contents as Uint8Arrays.
// There is an API to upload a support package from a File
// There a function to export the processed support package as a file to download in the browser.
export interface SupportPackageProps {

   // Set of filenames 
   // NOTE: This means when we are working with binary files, we need to convert them to a string.
   files: Record<string, string>;

   // These will be sorted by timestamp - which is stored in milliseconds since epoch
   entries : Array<ProcessedLogEntry>;
   
   // All discovered log files as a Map of filename -> Set of log entry indeces
   fileMap : Record<string, Array<number>>;   

   // All discovered log componentMap as a Map of component -> Set of log entry indeces
   componentMap : Record<string, Array<number>>;
   
   // All discovered log severities as a Map of severity -> Set of log entry indeces
   severityMap: Record<Severity, Array<number>>;
   
   filter: {
      componentMapeverity: Record<string, string>, // Map of component -> severity
      files: Array<string>, // Set of filenames to filter by
      timestampStart: number, // Start of the timestamp range
      timestampEnd: number, // End of the timestamp range
   };

   // Potentially very large blob of text that is the filtered log
   filteredLog: string; 

   // The chosenView is either the name of a file or "<Analysis>" or "<All logs>"
   chosenView: string;
}   

function createFile(state: SupportPackageProps, filename: string, contents: string)
{
   console.log('Creating file: ', filename, ' with content length: ', contents.length);
   state.files[filename] = contents;
}

function deleteFile(state: SupportPackageProps, filename: string)
{
   if (filename in state.files)
   {
      console.log('Removing file: ', filename);
      delete state.files[filename];
   }
}

function DecodeLogfile(filename: string, contents: Uint8Array): string
{
   // if the filename is of the form: log/<name>/container.log.n (where n is a number) then we need to decode it as a protobuf message
   if (filename.startsWith('logs/') && filename.search('/container.log') > 0)
   {
      return DecodeLogs(contents);
   }
   // otherwise we expect the contents to be a text file so we can convert each byte to a char:
   return new TextDecoder().decode(contents);
}

function DecompressSupportPackage(sp: SupportPackageProps, fileContents: Uint8Array)
{
   // get the file contents
   try 
   {
      const decompressedTarfile = gunzipSync(fileContents);

      // now we can parse the tarball
      parseTar(decompressedTarfile, (availableFile) => {
         // save the file to the SupportPackage
         if (availableFile.contents === undefined
            || availableFile.contents.length === 0
            )
         {
            return;
         }
   
         console.log('File available: ', availableFile.name);
   
         // if the file ends with '.gz' then we need to decompress it again
         if (availableFile.name.endsWith('.gz'))
         {
            console.log('File is a .gz file, attempting to decompress');
            const decompressedData = gunzipSync(availableFile.contents);
            // strip the .gz from the filename
            const decompressedFileName = availableFile.name.slice(0, -3);
            console.log('File decompressed. Saving to SupportPackage as ', decompressedFileName);
            createFile(sp, decompressedFileName, DecodeLogfile(decompressedFileName, decompressedData));
         }
         else
         {
            createFile(sp, availableFile.name, DecodeLogfile(availableFile.name, availableFile.contents));
         }      
      }, () => {
         console.log('All files parsed');              
      });
   }
   catch (err)
   {
      console.log('Error decompressing support package:', err, ' - assume it is an RTOS support package');
      // RTOS packages just need to be saved as the file "SupportPackage.txt"
      createFile(sp, 'SupportPackage.txt', new TextDecoder().decode(fileContents));
   }
}

function DecodeSupportPackageTxt(sp: SupportPackageProps, inputFilePath: string)
{
   const fileContent = sp.files[inputFilePath];

   // if the SupportPackage.txt file does not exist, return
   if (fileContent === undefined)
   {
      console.log('SupportPackage.txt file not found');
      return;
   }
   
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

   let dataModel: { [key: string]: any } = {};

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
               createFile(sp, expectedSection.destinaton, prettyDbContents);
            }
            else
            {
               createFile(sp, expectedSection.destinaton, sectionContents);
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
            (dataModel as { [key: string]: any })[expectedSection.field] = JSON.parse(sectionContents);
         }
      }      
   }

   // If dataModel has any fields, save it as a JSON file in pretty format
   if (Object.keys(dataModel).length > 0)
   {
      const prettySupportPackageData = JSON.stringify(dataModel, null, 3);
      createFile(sp, 'datamodel.json', prettySupportPackageData);
   }

   // remove the SupportPackage.txt file
   deleteFile(sp, inputFilePath);

   console.log('Sections have been successfully written to separate files.');
}

function ConcatenateOldWiserHomeLogs(sp: SupportPackageProps, logsFolder: string, fullLogsWritePath: string)
{   
   let wiserHomeLogContents = '';

   // Look for all files of the form wiser-homeN.txt where N is a number from 8 to 1
   for (let i = 8; i >= 0; i--)
   {
      let logFileName = 'wiser-home.' + i + '.txt';

      if (i == 0)
      {
         logFileName = 'wiser-home.txt';
      }

      const logFileToLookFor = logsFolder + logFileName;

      // if log file exists, copy it to fullLogsWritePath      
      try 
      {
         wiserHomeLogContents += sp.files[logFileToLookFor];
         // delete the file
         deleteFile(sp, logFileToLookFor);
      }
      catch (err)
      {
         console.log('Error reading wiser home log file: ', logFileToLookFor, ' - ', err);
      }

   }

   // if we have any wiser home logs, save them to the fullLogsWritePath
   if (wiserHomeLogContents.length > 0)
   {
      createFile(sp, fullLogsWritePath, wiserHomeLogContents);
   }
}

function ConcatenateContainerLocalLogs(sp: SupportPackageProps, logFolder: string, fullLogsWritePath: string)
{
   console.log('Concatenating container logs in folder: ', logFolder);

   let fullLogContents = '';

   // There may be multiple log files in the container folder of the form: 
   //   logFolder/container.log.1.gz
   //   logFolder/container.log.2.gz
   //   logFolder/container.log.3.gz
   //   etc.
   //
   // These will have already been decompressed by the DecompressSupportPackage function and we will end up with:
   // 
   //  logFolder/container.log.1
   //  logFolder/container.log.2
   //  logFolder/container.log.3
   //  etc.
   //
   // We now need to concatenate them into a single file
   // They should be in the format of a protobuf message of type LogEntry
   // They should be concatenated in order of their sequence number, startng with the oldest which will be the highest number
   // NOTE: sp.files is a Record<string, string> so we need to convert it to a Map<string, string> to use the .keys() method
   const logNames = Object.keys(sp.files)
                      .filter((key) => key.startsWith(logFolder + '/container.log.'));
   const partialLogFilenames = Array.from(logNames);

   // sort the files by their sequence number - highest first
   partialLogFilenames.sort((a, b) => {
      const aSeq = parseInt(a.split('.').pop() as string);
      const bSeq = parseInt(b.split('.').pop() as string);
      return bSeq - aSeq;
   });
   
   partialLogFilenames.forEach((partialLogFilename) => {
      console.log('Found container log: ', partialLogFilename);
         // append the contents of the file to the full log contents
      fullLogContents += sp.files[partialLogFilename];
      // delete the file
      deleteFile(sp, partialLogFilename);
   });

   // There should be one more file called container.log which is the current log file and is not compressed
   const currentLogFile = logFolder + '/container.log';
   try
   {
      fullLogContents += sp.files[currentLogFile];
      // delete the log file
      deleteFile(sp, currentLogFile);
   }
   catch (err)
   {
      console.log('Error reading current container log file: ', currentLogFile, ' - ', err);
   }

   // if we have any log contents, save them to the fullLogsWritePath
   if (fullLogContents.length > 0)
   {
      createFile(sp, fullLogsWritePath, fullLogContents);
   }
}

function ConcatenateAllLocalLogs(sp: SupportPackageProps)
{
   // First we should find all potential containers
   // We need to search for all files of the name 'log/<name>/container.log'
   const containerNames = Object.keys(sp.files)
                                     .filter(fn => fn.startsWith('logs/') && fn.endsWith('/container.log'))
                                     .map(fn => fn.split('/')[1]);
  
   console.log("Found containers: ", containerNames);

   // for each folder, call ConcatenateContainerLocalLogs
   containerNames.forEach((containerName) => { 
      const fullLogsWritePath = 'logs/' + containerName + '.log';
      ConcatenateContainerLocalLogs(sp, 'logs/' + containerName, fullLogsWritePath);
   });
}

function DecodeWiserHomeLogEntry(file: string, line: string): ProcessedLogEntry
{
   // [2024-07-16 20:44:38.339] [zigbee    ] [notice    ] Some message text

   let entry = { 
      unixtimestamp: 0,
      file: file,
      severity: Severity.Notice,
      component: "",
      message: line, // we should faithfully preserve the whole line here
   };

   let timestamp = line.substring(1, line.indexOf(']'));
   // convert the timestamp to a unix timestamp
   entry.unixtimestamp = new Date(timestamp).getTime();      
   line = line.substring(line.indexOf(']') + 1).trim();

   // extract the component
   const componentEnd = line.indexOf(']');
   entry.component = line.substring(1, componentEnd).trim();

   // extract the severity
   const severityStart = line.indexOf('[', componentEnd + 1);
   const severityEnd = line.indexOf(']', severityStart);
   entry.severity = getSeverityValueOrDefault(line.substring(severityStart + 1, severityEnd).trim());

   return entry;
}

function DecodeJournalLogEntry(filename: string, line: string): ProcessedLogEntry
{
   // Extract the timestamp
   let entry = { 
      unixtimestamp: 0,
      file: filename,
      severity: getSeverityDefaultValue(),
      component: "",
      message: line, // we should faithfully preserve the whole line here
   };

   // This is a journal log entry of the form:
   // Oct 02 07:00:54 WiserHeat05C2D7 component[id]: message text

   let timestamp = line.substring(0, 15);
   // as the timestamp in Journal logs does not contain the timezone, we need to add it
   timestamp += 'Z';
   // convert the timestamp to a unix timestamp
   const date = new Date(timestamp);
   
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
   // Note: Journal componentMap sometimes have a suffix of [id] which we should remove
   const idStart = entry.component.indexOf('[');
   if (idStart !== -1)
   {
      entry.component = entry.component.substring(0, idStart).trim();
   }

   // Cannot extract the severity, so just leave it at "notice"

   return entry;   
}

function CreateLogEntryFromLine(default_timestamp: number, filename: string, text: string): ProcessedLogEntry
{
   // If the very first characeter This is a wiser-home log entry of the form:
   // [2024-07-16 20:44:38.339] [zigbee    ] [notice    ] Some message text
   if (text.startsWith('['))
   {
      return DecodeWiserHomeLogEntry(filename, text);
   }
   // else if the line begins with a letter, then it is an old style journal entry of the form: 
   // Oct 02 07:00:54 WiserHeat05C2D7 component[id]: message text
   else if (text[0].match(/[a-z]/i))
   {
      return DecodeJournalLogEntry(filename, text);
   }

   // TODO: This is a new style log entry   
   return { 
      unixtimestamp: default_timestamp, 
      file: filename, 
      severity: Severity.Notice, 
      component: "", 
      message: text 
   };
}

function IngestTextualLogFileToDB(sp: SupportPackageProps, filename: string)
{  
   // The shortFilename should be the name of the file without the path or the suffix
   const shortFilename = filename.split('/').pop()?.split('.').shift() as string;
   let default_timestamp = 0;

   console.log('Ingesting log file: ', filename, ' as ', shortFilename);

   // create a Reader for the string contents of the file
   sp.files[filename]?.split('\n').forEach((line) => {

      if (line === null || line.trim() === '')
      {
         return; // if line is null or empty, skip it
      }

      const entry = CreateLogEntryFromLine(default_timestamp, shortFilename, line);
      if (entry !== null)
      {
         sp.entries.push(entry);
         // set the default timestamp to the last entry
         // if the next entry cannot determine its timestamp, we will use this one
         default_timestamp = entry.unixtimestamp; 
      }
   });
}

function CreateLogDB(sp: SupportPackageProps)
{
   const logFiles = Object.keys(sp.files).filter(fn => fn.endsWith('.log'));

   // Read all log files and create a log structure
   logFiles.forEach((logFile) => {
      IngestTextualLogFileToDB(sp, logFile);
   });

   console.log('Sorting log entries by timestamp... this may take a while: we have ', sp.entries.length, ' entries');
   sp.entries.sort((a, b) => a.unixtimestamp - b.unixtimestamp);
   console.log('Log entries have been sorted by timestamp.');

   console.log('Creating searchable log maps...');
   sp.entries.forEach((entry, index) => {

      // componentMap
      if (!(entry.component in Object.keys(sp.componentMap)))
      {
         sp.componentMap[entry.component] = [];
      }
      sp.componentMap[entry.component].push(index);

      // severity
      if (!(entry.severity in Object.keys(sp.severityMap)))
      {
         sp.severityMap[entry.severity] = [];
      }  
      sp.severityMap[entry.severity].push(index);

      // files
      if (!(entry.file in Object.keys(sp.fileMap)))
      {
         sp.fileMap[entry.file] = [];
      }
      sp.fileMap[entry.file].push(index);
   });  

   console.log('Searchable log maps have been created.');
}

// This function will perform the following actions:
// - decompress the support package (it will auto-detect if it is an old style RTOS support package and NOT decompress it) 
// - decode the SupportPackage.txt file
// - concatenate any old-style Wiser Home logs (the ones created by spdlog)
// - explore the decompressed folder and extract any docker local logs folders it finds (new style logs from multi-container support packages)
// - create a log structure from the logs and store this in sp for later use in the API
//
// @param source_file - the full path to the source file which should be a tar.gz file downloaded from the Wiser One Portal
// @param destination_dir - the full path to the destination directory where the decompressed files will be stored
function PostProcessSupportPackage(sp: SupportPackageProps, contents: string)
{
   try 
   {
      // first, we need to decode our base64 encoded string into a Uint8Array
      // NOTE: That the contents begin with something like this: "data:application/gzip;base64,H4sIAAAAAAAACw=="
      // We need to strip that out...
      const base64Contents = contents.split(',')[1];
      const binaryContents = Buffer.from(base64Contents, 'base64');
            
      DecompressSupportPackage(sp, binaryContents);
      
      console.log('Support package has been decompressed, attempting to process it');
      
      DecodeSupportPackageTxt(sp, 'SupportPackage.txt');
   
      console.log('Attempting to concatenate old Wiser Home logs');
      ConcatenateOldWiserHomeLogs(sp, 'log/', 'logs/wiser-home.log');
   
      console.log('Attempting process any container local logs found in the support package');
      ConcatenateAllLocalLogs(sp);
   
      console.log('Attempting to create a log structure from all files in /logs folder');
      CreateLogDB(sp);
   }
   catch (err)
   {
      console.log('Error processing support package: ', err);
   }
}

export const supportPackageSlice = createSlice({
   name: 'supportPackage',
   
   initialState: {
      files:        {} as Record<string, string>,        // All discovered files in the support package as 
      
      entries:      new Array<ProcessedLogEntry>(),   // All discovered log entries and their metadata
      fileMap:      {} as Record<string, Array<number>>,   // All discovered log files as a Map of filename -> Set of log entry indeces
      componentMap: {} as Record<string, Array<number>>,   // All discovered log componentMap as a Map of component -> Set of log entry indeces
      severityMap:  {} as Record<Severity, Array<number>>,   // All discovered log severities as a Map of severity -> Set of log entry indeces

      filter: {
         componentMapeverity: {}, // Map of component -> severity
         files: new Array<string>(), // Set of filenames to filter by
         timestampStart: 0, // Start of the timestamp range
         timestampEnd: 0, // End of the timestamp range
      },

      filteredLog: "", // Potentially very large blob of text that is the filtered log
      chosenView: "<Analysis>", // The chosenView is either the name of a file or "<Analysis>" or "<All logs>"
   },
   
   reducers: {
      uploadSupportPackage: (state, action: PayloadAction<string>) => {
         PostProcessSupportPackage(state, action.payload);
      },
      applyFilter: (state, action) => {
         state.filter = action.payload;
         // update the filtered log
         // TODO: implement this
      },
      applyChosenView: (state, action) => {
         state.chosenView = action.payload;
      }
   }
})
 
// Action creators are generated for each case reducer function
export const { uploadSupportPackage, applyFilter } = supportPackageSlice.actions
 
export default supportPackageSlice.reducer
