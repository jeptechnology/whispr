'use client';

import React from "react";
import { useContext } from "react"; 
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { uploadSupportPackage, applyFilter } from '@/app/api/SupportPackage';
import { SupportPackageProps } from "@/app/api/SupportPackage";

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

// define the JsonViewer component props
export interface JsonViewerProps {
    filename?: string;
}


const JsonViewer = (props: JsonViewerProps ) => {

    const files = useSelector((state: SupportPackageProps) => state.files);

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
