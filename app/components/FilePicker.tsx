'use client';

import React from "react";
import { useState } from "react"; 
import { Dropdown } from "primereact/dropdown";

// define the FilePicker component props
export interface FilePickerProps {
   files: Map<string, string>;
   onFileSelected?: (filename: string, displayAsJson: boolean) => void;
}

const FilePicker = (props: FilePickerProps) => {

    const [selectedFile, setSelectedFile] = useState<string>();

    function onFileSelect(e: any) {
      let filename = e.value;   
      setSelectedFile(filename);

      if (props.onFileSelected) {
         const displayAsJson = filename.endsWith(" [json]");
         if (displayAsJson)
         {
            filename = filename.replace(" [json]", "");
         }
         props.onFileSelected(filename, displayAsJson);
      }
    }

    // map the files to the dropdown options
    const options: string[] = props.files.size === 0 ? [] : ["<Analysis>", "<All logs>"];

    props.files.forEach((_, filename) => {
        
      options.push(filename);

      // if this is JSON, add another option to display as JSON
      if (filename.endsWith(".json")) {
        options.push(filename + " [json]");
      }
    });

    return (
      <Dropdown value={selectedFile} options={options} placeholder="Select a view" onChange={onFileSelect} />
    );
};

export default FilePicker;
