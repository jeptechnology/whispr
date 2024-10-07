// NOTE: The following code is in reference to docker's logdriver plugin API
// https://github.com/docker/go-docker/blob/master/api/types/plugins/logdriver/io.go

var protobuf = require("protobufjs/minimal");
var { LogEntry } = require("./proto/dockerlogs");
var fs = require("fs");

function ReadBigEndian32bit(reader) {
   const buffer = reader.buf;
   const offset = reader.pos;
   const value =
      (buffer[offset] << 24) |
      (buffer[offset + 1] << 16) |
      (buffer[offset + 2] << 8) |
      buffer[offset + 3];
   reader.pos += 4;
   return value;
}

function DecodeLocalLogs(source_file, destination_file) {
   // open up an output buffer to a file
   var output = fs.createWriteStream(destination_file);

   var myFileContents = fs.readFileSync(source_file);
   var reader = protobuf.Reader.create(myFileContents);

   while (reader.pos < reader.len) {
      const length = ReadBigEndian32bit(reader);

      // now that we have the length of this log line, make a note of the current position, and then decode the message
      const oldReaderLength = reader.len;
      reader.len = reader.pos + length;
      var message = LogEntry.decode(reader);
      reader.len = oldReaderLength;

      // We should expect to see the same length as we read in the first 4 bytes
      if (length != ReadBigEndian32bit(reader)) {
         console.log(
            "Length mismatch: " +
               length +
               " != " +
               lengthCheck +
               " at position " +
               reader.pos
         );
         break;
      }

      // get timestamp in nanoseconds
      const timestamp = message.timeNano;
      const date = new Date(timestamp / 1000000);

      // write the log line to the output file
      output.write(date.toISOString() + " " + message.line + "\n");
   }
}

// export the function so it can be used in other modules
module.exports = {
   DecodeLocalLogs
}