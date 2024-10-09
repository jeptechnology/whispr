'use client';

import React from "react";
import { useContext, useState } from "react"; 
import { SupportPackageContext } from "../../../api/SupportPackage";
import { Dropdown } from "primereact/dropdown";

// define the FilePicker component props
export interface FilePickerProps {
   onFileSelected?: (filename: string, displayAsJson: boolean) => void;
}

const FilePicker = (props: FilePickerProps) => {

    const sp = useContext(SupportPackageContext);
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
    const options: string[] = ["<All logs>"];
    sp.files.forEach((_, filename) => {
        
      options.push(filename);

      // if this is JSON, add another option to display as JSON
      if (filename.endsWith(".json")) {
        options.push(filename + " [json]");
      }
    });

    return (
      <Dropdown value={selectedFile} options={options} placeholder="Select a file to view" onChange={onFileSelect} />
    );
};

export default FilePicker;
