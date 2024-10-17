'use client';

import React from "react";
import { useState } from "react"; 
import FilePicker from "./FilePicker"; // For selecting files
import LogViewer from "./LogViewer"; // For log files
import JsonViewer from "./JsonViewer"; // For json files

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
