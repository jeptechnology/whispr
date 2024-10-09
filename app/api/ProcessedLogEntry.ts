// A ProcessedLogEntry has the following properties:
//  - unixtimestamp: number in milliseconds
//  - file: string - the name of the file this log entry came from
//  - severity: Severtity - the severity of the log entry
//  - component: string - the component that generated the log entry e.g. zigbee, wifi, cloud
//  - message: string, // we should faithfully preserve the whole line here even with timestamps if they exist

import { Severity } from './Severity';

export interface ProcessedLogEntry {
      unixtimestamp: number;
      file: string;
      severity: Severity;
      component: string;
      message: string;
   };
