// import express library - for web server
const express = require("express");
const webserver = express();
const port = 3000;

// import file system library - for file operations
const fs = require("fs");
const path = require("path");

// import the severity module - for mapping between syslog severity levels and their corresponding numeric values
const severityAPI = require("./severity");
const support_package = require("./support_package");

webserver.use(express.json());
webserver.use(express.static(__dirname + "/public"));
webserver.use(express.static(__dirname + "/support_package"));

webserver.post(
   "/upload",
   upload.single("support_package"),
   function (req, res, next) {
      // req.file is the `avatar` file
      // req.body will hold the text fields, if there were any
      console.log("Attempting to untar: ", req.file.path);

      if (fs.existsSync(__dirname + "/support_package")) {
         fs.rmSync(__dirname + "/support_package", { recursive: true });
         fs.mkdirSync(__dirname + "/support_package");
      }

      decompress(req.file.path, __dirname + "/support_package", {
         plugins: [decompressTargz()],
      })
         .then(() => {
            console.log(
               "Files decompressed, attempting to decode SupportPackage.txt"
            );
            postProcessSupportPackage();
            res.json({ message: "File uploaded successfully!" });
         })
         .catch((err) => {
            console.log(
               "Files could not be decompressed, this may be an old RTOS support package. Attempting to decode it as if it were SupportPackage.txt"
            );
            fs.copyFileSync(
               req.file.path,
               path.join(__dirname, "support_package", "SupportPackage.txt")
            );
            postProcessSupportPackage();
            res.json({ message: "File uploaded successfully!" });
         })
         .finally(() => {
            console.log("Removing uploaded file from server: ", req.file.path);
            fs.unlinkSync(req.file.path, (err) => {
               if (err) {
                  console.error(err);
                  return;
               }
            });
         });
   }
);

webserver.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});

function validateQueryParams(req) {
   // Gather the query parameters here...
   const file = req.query.file;
   const component = req.query.component;
   let severity = req.query.severity;
   let start = req.query.start;
   let end = req.query.end;

   if (start) {
      start = Date.parse(start);
      if (isNaN(start)) {
         return { status: 400, message: "Invalid start time: " + start };
      }
   }

   if (end) {
      end = Date.parse(end);
      if (isNaN(end)) {
         return { status: 400, message: "Invalid end time: " + end };
      }
   }

   // if a component is specified, check if it exists
   if (component) {
      if (support_package.spdb.components[component] === undefined) {
         return { status: 400, message: "Component not found" };
      }
   }

   // if a severity is specified, check if it exists
   if (severity) {
      // if severity is not a number, then we need to convert it to a number
      if (isNaN(severity)) {
         severity = severityAPI.getSeverityValue(severity);
      }

      if (severity === null) {
         return { status: 400, message: "Invalid severity: " + severity };
      }
   }

   // if a file is specified, check if it exists
   if (file) {
      if (support_package.spdb.files[file] === undefined) {
         return { status: 400, message: "File not found" };
      }
   }

   return { status: 200, message: "OK" };
}

// Define the API routes
// GET /api/log?component=component&severity=severity&file=file?start=start&end=end
webserver.get("/api/log", (req, res) => {
   // Gather the query parameters here...
   const response = validateQueryParams(req);
   if (response.status !== 200) {
      res.status(response.status).json({ message: response.message });
      return;
   }

   const file = req.query.file;
   const component = req.query.component;
   let severity = req.query.severity;
   let start = req.query.start;
   let end = req.query.end;

   // convert start and end to unix timestamps
   if (start) start = Date.parse(start);
   if (end) end = Date.parse(end);

   // create a set of all possible indeces in the log map - this will be 0..n-1 where n is the number of log entries
   let log_indeces = new Set();
   for (let i = 0; i < support_package.spdb.entries.length; i++)
      log_indeces.add(i);

   if (component) {
      log_indeces = log_indeces.intersection(
         support_package.spdb.components[component]
      );
   }

   if (severity) {
      // if severity is not a number, then we need to convert it to a number
      if (isNaN(severity)) {
         severity = severityAPI.getSeverityValue(severity);
      }

      if (severity === null) {
         res.status(400).json({ message: "Invalid severity: " + severity });
         return;
      }

      severitySet = new Set();
      // Make a union of all entries that are the given severity or higher (i.e. as least as severe as the given severity)
      for (let i = severity; i <= severityAPI.highestSeverity; i++) {
         if (support_package.spdb.severity[i] !== undefined) {
            severitySet = severitySet.union(support_package.spdb.severity[i]);
         }
      }

      log_indeces = log_indeces.intersection(severitySet);
   }

   if (file) {
      log_indeces = log_indeces.intersection(support_package.spdb.files[file]);
   }

   // before we generate the filtered log, we need to sort the log_indeces
   log_indeces = Array.from(log_indeces).sort();

   // create a string of all log entries that match the filter and are between the start and end times (if supplied)
   logText = "";
   log_indeces.forEach((index) => {
      // check we are beyond start and before end
      if (start && support_package.spdb.entries[index].unixtimestamp < start) {
         return;
      }
      if (end && support_package.spdb.entries[index].unixtimestamp > end) {
         return;
      }
      logText += support_package.spdb.entries[index].message + "\n";
   });

   res.status(200).type("text/plain");
   res.send(logText);
});

// GET /api/log/structure
// This will produce a list of files and components that have been found in the logs
webserver.get("/api/structure", (req, res) => {
   // we need to search the support_package directory for all log files
   const supportPackagePath = path.join(__dirname, "support_package");
   // find all files but filter out directories
   const allFiles = fs
      .readdirSync(supportPackagePath)
      .filter((fn) => fs.lstatSync(path.join(supportPackagePath, fn)).isFile());

   res.json({
      components: Object.keys(support_package.spdb.components),
      severity: Object.keys(support_package.spdb.severity),
      logs: Object.keys(support_package.spdb.files),
      files: allFiles,
   });
});

// export webserver for use in app.js
module.exports = {
   webserver
};