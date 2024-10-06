// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const protobuf = require("protobufjs");

protobuf.load(__dirname + "/proto/dockerlogs.proto", function(err, root) {
   if (err)
       throw err;

   // Obtain a message type
   var LogEntry = root.lookupType("LogEntry");

   // Exemplary payload
   var payload = { 
      source: "stout",
      time_nano: "12345",
      line: "Hello, World!"
   };

   // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
   var errMsg = LogEntry.verify(payload);
   if (errMsg)
       throw Error(errMsg);

   // Create a new message
   var message = LogEntry.create(payload); // or use .fromObject if conversion is necessary

   // Encode a message to an Uint8Array (browser) or Buffer (node)
   var buffer = LogEntry.encode(message).finish();
   // ... do something with buffer

   // Decode an Uint8Array (browser) or Buffer (node) to a message
   var message = LogEntry.decode(buffer);
   // ... do something with message

   // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.
});