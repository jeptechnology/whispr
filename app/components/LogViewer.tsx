import React from "react";
import { LazyLog } from "@melloware/react-logviewer";
import { useAppStore, useAppSelector } from "../hooks";

const LogViewer = () => {

    const store = useAppStore();
    const filteredLog = useAppSelector((state) => state.supportPackage.filteredLog);

    console.log('LogViewer: filteredLog=', filteredLog);

    return (
        <div>
            <LazyLog 
            width={'90vw'}
            caseInsensitive
            enableHotKeys
            enableSearch
            extraLines={1}
            text={filteredLog}                    
            />
        </div>
    );
};

export default LogViewer;
