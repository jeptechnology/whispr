import React from "react";
import { useContext } from "react"; 
import { LazyLog } from "@melloware/react-logviewer";
import { SupportPackageContext } from "../../../api/SupportPackage";

// define the LogViewer component props
export interface LogViewerProps {
    filename?: string;
}


const LogViewer = (props: LogViewerProps ) => {

    const sp = useContext(SupportPackageContext);

    console.log("LogViewer wants to read file: ", props.filename);
    console.log("SupportPackage has file?: ", sp.files.has(props.filename || ""));

    const text = props.filename ? sp.files.get(props.filename) : "No file selected";

    console.log("LogViewer text: ", text); 

    return (
        <LazyLog 
            caseInsensitive
            enableHotKeys
            enableSearch
            extraLines={1}
            // height={1600}
            text={text}                    
            />
    );
};

export default LogViewer;
