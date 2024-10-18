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
      console.log("Files: ", files);
      let options = ["<Summary>", "<Logs>"];

      Object.keys(files ? files : {}).forEach((filename) => {       
        options.push(filename);
      });


      setOptions(options);
    }, [files]);

    return (
      <Dropdown value={selectedFile} options={options} placeholder="Select a view" onChange={onFileSelect} />
    );
};

export default FilePicker;
