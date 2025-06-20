// NOTE: The following code is in reference to docker's logdriver plugin API
// https://github.com/docker/go-docker/blob/master/api/types/plugins/logdriver/io.go

// import * as protobuf from "protobufjs";
import { LogEntry } from "./proto/dockerlogs";
import { util, Long, Reader } from "protobufjs";

function ReadBigEndian32bit(reader: protobuf.Reader): number {
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

function IsStartOfMessage(reader: protobuf.Reader): boolean {
   // We are at the start of a message if the next 3 bytes are 0x00, 0x00, 0x00
   if (reader.pos + 5 > reader.len) {  // Check if we have enough bytes to read  
      return false; // Not enough bytes to read a length
   }

   const buffer = reader.buf;
   const offset = reader.pos; 
   return (
      // First 3 bytes must be 0x00, 0x00, 0x00
      buffer[offset] === 0x00 &&
      buffer[offset + 1] === 0x00 &&
      buffer[offset + 2] === 0x00 &&
      // We don't care about the 4th byte
      // 5th byte must be a LineFeed (0x0A)
      buffer[offset + 4] === 0x0A 
   );   
}

export default function DecodeLocalLogs(source: Uint8Array, logName: string): string {

   let myFileContents ='';
   var reader = Reader.create(source);

   while (reader.pos < reader.len) {
      const length = ReadBigEndian32bit(reader);

      // now that we have the length of this log line, make a note of the current position, and then decode the message
      const oldReaderLength = reader.len;
      reader.len = reader.pos + length;
      
      var message: LogEntry;
      var error = false;
      try {
         message = LogEntry.decode(reader);
      }
      catch (e) {
         message = new LogEntry();
         message.line = "!!!!! Decoding error in log file '" + logName + "': " + e;
         error = true;
      }
      
      reader.len = oldReaderLength;

      // We should expect to see the same length as we read in the first 4 bytes
      if (!error)
      {
         const lengthCheck = ReadBigEndian32bit(reader);
         if (length != lengthCheck) 
         {
            message.line = "!!!!! Length mismatch in log file '" + logName + "': " + length + " != " + lengthCheck + " at position " + reader.pos;
            error = true;
         }
      }
      
      if (error) 
      {
         const errorPosition = reader.pos;
         // attempt to recover by skipping the rest of the message
         while (!IsStartOfMessage(reader) && reader.pos < reader.len) {
            reader.pos++;
         }

         if (reader.pos >= reader.len) {
            message.line += " - reached end of file while trying to recover";
         } else {
            message.line += " - recovered, continuing to decode logs at position " + reader.pos;
         }
         const skippedText = new TextDecoder("utf-8").decode(source.slice(errorPosition, reader.pos));
         message.line += ". Skipped text was: \n" + skippedText;         
      }

      // get timestamp in nanoseconds
      // NOTE: if message.timeNano is a Long object, it needs to be converted to a number
      if (message.timeNano) 
      {
         const timestamp = util.LongBits.from(message.timeNano).toNumber() / 1000000;
         const date = new Date(timestamp);
         myFileContents += "[" + date.toISOString() + "] " + message.line + "\n";
      }
      else
      {
         myFileContents += message.line + "\n";
      }
   }

   return myFileContents;
}
