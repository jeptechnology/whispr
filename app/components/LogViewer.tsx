import React from "react";
import { useContext } from "react"; 
import { LazyLog } from "@melloware/react-logviewer";
import { SupportPackageContext } from "../api/SupportPackage";

// define the LogViewer component props
export interface LogViewerProps {
    filename?: string;
}


const LogViewer = (props: LogViewerProps ) => {

    const sp = useContext(SupportPackageContext);

    return props.filename ? 
    (
        <LazyLog 
            caseInsensitive
            enableHotKeys
            enableSearch
            extraLines={1}
            // height={1600}
            text={sp.files.get(props.filename)}                    
            />
    ) : (
        <div/>
    );
};

export default LogViewer;
