'use client';

import React, { use } from "react";
import { useContext, useState, useEffect } from "react"; 
import { SupportPackageContext } from "../../../api/SupportPackage";
import { Dropdown } from "primereact/dropdown";
import LogViewer from "./LogViewer"; // For log files
import JsonViewer from "./JsonViewer"; // For json files

const FileViewer = () => {

    const sp = useContext(SupportPackageContext);
    const [selectedFile, setSelectedFile] = useState<string>();

    function onFileSelect(e: any) {
        setSelectedFile(e.value);
    }

    // map the files to the dropdown options
    const options: string[] = [];
    sp.files.forEach((_, filename) => {
        options.push(filename);
    });

    return (
        <div className="grid">
            <div className="col-12">
                <Dropdown value={selectedFile} options={options} placeholder="Select a file to view" onChange={onFileSelect} />
            </div>
            <div className="col-12" style={{ height: "calc(100vh - 200px)" }}>
                { selectedFile && selectedFile.endsWith(".log") ? 
                (
                  <LogViewer filename={selectedFile}/>
                ) : (
                  <JsonViewer filename={selectedFile}/>
                ) }
            </div>            
        </div>
    );
    


};

export default FileViewer;
