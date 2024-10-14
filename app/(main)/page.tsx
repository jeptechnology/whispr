'use client';

import React, { use } from "react";
import { useContext, useState, useEffect } from "react"; 
import { SupportPackageContext } from "../api/SupportPackage";
import FilePicker from "./pages/file_viewer/FilePicker"; // For file selection
import LogViewer from "./pages/file_viewer/JsonViewer"; // For log files
import JsonViewer from "./pages/file_viewer/JsonViewer"; // For json files

const FileViewer = () => {

    const sp = useContext(SupportPackageContext);
    const [selectedFile, setSelectedFile] = useState<string>();
    const [displayAsJson, setDisplayAsJson] = useState<boolean>(false);  

    function onFileSelect(filename: string, displayAsJson: boolean) {
        setSelectedFile(filename);
        setDisplayAsJson(displayAsJson);
    }

    return (
        <div className="grid">
            <div className="col-12">
                <FilePicker onFileSelected={onFileSelect}/>
            </div>
            <div className="col-12" style={{ height: "calc(100vh - 200px)" }}>
                { selectedFile ? 
                    displayAsJson ?
                    <JsonViewer filename={selectedFile}/>
                    :
                    <LogViewer filename={selectedFile}/>                
                : (
                    <div/>
                )}
            </div>            
        </div>
    );
    


};

export default FileViewer;