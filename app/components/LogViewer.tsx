import React from "react";
import { LazyLog } from "@melloware/react-logviewer";
import { useAppStore, useAppSelector } from "../hooks";

const LogViewer = () => {

    const filteredLog = useAppSelector((state) => state.supportPackage.filteredLog);

    console.log('LogViewer: filteredLog length is ', filteredLog?.length);

    return (
        <div className="col-12" style={{ height: "calc(100vh - 200px)" }}>
            <LazyLog 
            width={'90vw'}
            caseInsensitive
            enableHotKeys
            enableSearch
            // extraLines={1}
            text={filteredLog}                    
            />
        </div>
    );
};

export default LogViewer;
