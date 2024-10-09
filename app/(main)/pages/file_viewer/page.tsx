'use client';

import React, { use } from "react";
import { useContext, useState, useEffect } from "react"; 
import { SupportPackageContext } from "../../../api/SupportPackage";
import { Dropdown } from "primereact/dropdown";
import LogViewer from "./LogViewer";

const FileViewer = () => {

    const sp = useContext(SupportPackageContext);
    const [selectedFile, setSelectedFile] = useState<string>();

    function onFileSelect(e: any) {
        setSelectedFile(e.value.label);
    }

    // map the files to the dropdown options
    const options: { label: string }[] = [];
    sp.files.forEach((_, filename) => {
        options.push({ label: filename });
    });

    return (
        <div className="grid">
            <div className="col-12">
                <Dropdown options={options} placeholder="Select a file to view" onChange={onFileSelect} />
            </div>
            
            {/* <div className="col-12" style={{ height: "calc(100vh - 200px)" }}> */}
            <div className="col-12" style={{ height: "flex" }}>
                <LogViewer filename={selectedFile}/>
            </div>            
        </div>
    );
    


};

export default FileViewer;
