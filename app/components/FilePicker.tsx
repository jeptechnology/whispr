'use client';

import React, { useEffect } from "react";
import { useState } from "react"; 
import { Dropdown } from "primereact/dropdown";
import { useAppSelector } from "../hooks";

// define the FilePicker component props
export interface FilePickerProps {
   onFileSelected?: (filename: string, displayAsJson: boolean) => void;
}

const FilePicker = ({ onFileSelected }: FilePickerProps) => {

    const [selectedFile, setSelectedFile] = useState<string>();
    const [options, setOptions] = useState<string[]>();
    const files = useAppSelector((state) => state.supportPackage.files);

    function onFileSelect(e: any) {
      let filename = e.value;   
      setSelectedFile(filename);

      if (onFileSelected) {
         onFileSelected(filename, filename.endsWith(".json"));
      }
    }

    useEffect(() => {
      let options = ["<Summary>", "<Logs>"];

      Object.keys(files ? files : {}).forEach((filename) => {
        // if this is a log file, exclude it from the list of options
        if (filename.endsWith(".log")) {
          return;
        }       
        options.push(filename);
      });


      setOptions(options);
    }, [files]);

    return (
      <Dropdown value={selectedFile} options={options} placeholder="Select a view" onChange={onFileSelect} />
    );
};

export default FilePicker;
