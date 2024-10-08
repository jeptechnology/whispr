'use client';
import { createContext } from 'react';
import { Severity } from './Severity';

// Severity is an enum that defines the severity levels of log entries.

export interface LogEntry {
   unixtimestamp: number;
   log_file: string;
   severity: Severity;
   component: string;
   log_entry: string;
}

// SupportPackageProps is an interface that defines the props of the SupportPackage component.
// There is a map of filenames and their contents as Uint8Arrays.
// There is an API to upload a support package from a File
// There a function to export the processed support package as a file to download in the browser.
export interface SupportPackageProps {

   // Map of filenames and their contents as Uint8Arrays.
   supportPackage: Map<string, Uint8Array>;

   // These will be sorted by timestamp - which is stored in milliseconds since epoch
   entries : Map<number, LogEntry>;
   
   // All discovered log components as a Map of component -> Set of log entry indeces
   components : Map<string, Set<number>>;
   
   // All discovered log severities as a Map of severity -> Set of log entry indeces
   severity: Map<Severity, Set<number>>;
   
   // All discovered log files as a Map of file -> Set of log entry indeces
   files : Map<string, Set<number>>;

   // API to upload a support package from a File
   uploadSupportPackage: (file: File, onCompleted: (result: boolean) => void) => void;

   // Function to export the processed support package as a file to download in the browser.
   exportSupportPackage: () => void;
}

export const SupportPackageProvider = ({ children }: ChildContainerProps) => {

   

   const value: SupportPackageProps = {
      supportPackage: undefined,
      entries: undefined,
      components: undefined,
      severity: undefined,
      files: undefined,
      uploadSupportPackage: function (file: File, onCompleted: (result: boolean) => void): void {
         throw new Error('Function not implemented.');
      },
      exportSupportPackage: function (): void {
         throw new Error('Function not implemented.');
      }
   };

   return <SupportPackageContext.Provider value={value}>{children}</SupportPackageContext.Provider>;
};

