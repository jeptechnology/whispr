import React from "react";
import { LazyLog } from "@melloware/react-logviewer";
import { useDispatch, useSelector } from 'react-redux';
import { SupportPackageProps } from "../api/SupportPackage";

// define the LogViewer component props
export interface LogViewerProps {
    filename?: string;
}


const LogViewer = (props: LogViewerProps ) => {

    const text = useSelector((state: SupportPackageProps) => state.filteredLog);

    return props.filename ? 
    (
        <LazyLog 
            caseInsensitive
            enableHotKeys
            enableSearch
            extraLines={1}
            // height={1600}
            text={text}                    
            />
    ) : (
        <div/>
    );
};

export default LogViewer;
