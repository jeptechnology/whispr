'use client';

import React from "react";
import { useContext } from "react"; 
import { SupportPackageContext } from "../../../api/SupportPackage";
import ReactJson from '@microlink/react-json-view'

// define the JsonViewer component props
export interface JsonViewerProps {
    filename?: string;
}


const JsonViewer = (props: JsonViewerProps ) => {

    const { files } = useContext(SupportPackageContext);

    function ParseJsonFile(): any {
        if (!props.filename) {
            return {};
        }
        const content = files.get(props.filename);
        if (content === undefined) {
            return {};
        }
        return JSON.parse(content);
    }

    return props.filename ? 
    (
        <ReactJson 
            src={ParseJsonFile()} 
            theme="monokai"
            iconStyle="circle"
            indentWidth={4}
            displayDataTypes={false}
            onAdd={false}
            onEdit={false}
            onDelete={false}
            collapsed={3}
        />
    ) : (
        <div/>
    );
};

export default JsonViewer;
