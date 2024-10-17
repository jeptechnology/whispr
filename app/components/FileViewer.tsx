'use client';

import React from "react";
import { useState } from "react"; 
import FilePicker from "../../../components/FilePicker"; // For selecting files
import LogViewer from "../../../components/LogViewer"; // For log files
import JsonViewer from "../../../components/JsonViewer"; // For json files
import { useDispatch, useSelector } from 'react-redux';
import { uploadSupportPackage, applyFilter } from '@/app/api/SupportPackage';
import { SupportPackageProps } from "@/app/api/SupportPackage";

const FileViewer = () => {

    const [selectedFile, setSelectedFile] = useState<string>();
    // const [displayAsJson, setDisplayAsJson] = useState<boolean>(false);  

    function onFileSelect(filename: string, displayAsJson: boolean) {
        setSelectedFile(filename);
        // setDisplayAsJson(displayAsJson);
    }

    return (
        <div className="grid">
            <div className="col-12">
                <FilePicker onFileSelected={onFileSelect}/>
            </div>
            <div className="col-12" style={{ height: "calc(100vh - 200px)" }}>
                { selectedFile ? 
                        <LogViewer filename={selectedFile}/>
                : (
                    <div/>
                )}
            </div>            
        </div>
    );
    


};

export default FileViewer;
