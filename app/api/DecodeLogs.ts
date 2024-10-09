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

export default function DecodeLocalLogs(source: Uint8Array): string {

   let myFileContents ='';
   var reader = Reader.create(source);

   while (reader.pos < reader.len) {
      const length = ReadBigEndian32bit(reader);

      // now that we have the length of this log line, make a note of the current position, and then decode the message
      const oldReaderLength = reader.len;
      reader.len = reader.pos + length;
      var message = LogEntry.decode(reader);
      reader.len = oldReaderLength;

      // We should expect to see the same length as we read in the first 4 bytes
      const lengthCheck = ReadBigEndian32bit(reader);
      if (length != lengthCheck) 
      {
         myFileContents += "!!!!! Length mismatch whjilst decoding logs: " + length + " != " + lengthCheck + " at position " + reader.pos + "\n";
         break;
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
