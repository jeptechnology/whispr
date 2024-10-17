'use client';

import React, { useEffect } from "react";
import { useState } from "react"; 
import { Dropdown } from "primereact/dropdown";
import { SupportPackageProps } from '@/app/api/SupportPackage';
import { useDispatch, useSelector } from 'react-redux';
import { uploadSupportPackage, applyFilter } from '@/app/api/SupportPackage';

// define the FilePicker component props
export interface FilePickerProps {
   onFileSelected?: (filename: string, displayAsJson: boolean) => void;
}

const FilePicker = ({ onFileSelected }: FilePickerProps) => {

    const [selectedFile, setSelectedFile] = useState<string>();
    const [options, setOptions] = useState<string[]>();
    const files = useSelector((state: SupportPackageProps) => state.files);

    function onFileSelect(e: any) {
      let filename = e.value;   
      setSelectedFile(filename);

      if (onFileSelected) {
         const displayAsJson = filename.endsWith(" [json]");
         if (displayAsJson)
         {
            filename = filename.replace(" [json]", "");
         }
         onFileSelected(filename, displayAsJson);
      }
    }

    useEffect(() => {
      console.log("Files: ", files);
      let options = ["<All Logs>", "<Analysis>"];

      Object.keys(files ? files : {}).forEach((filename) => {
        
        options.push(filename);

        // if this is JSON, add another option to display as JSON
        if (filename.endsWith(".json")) {
          options.push(filename + " [json]");
        }
      });


      setOptions(options);
    }, [files]);

    return (
      <Dropdown value={selectedFile} options={options} placeholder="Select a view" onChange={onFileSelect} />
    );
};

export default FilePicker;
