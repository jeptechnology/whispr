'use client';

import React, { useContext, useEffect } from "react";
import LogViewer from "../components/LogViewer"; // For log files
import JsonViewer from "../components/JsonViewer"; // For json files
import Analysis from "../components/Analysis";
import { SupportPackageContext } from "../api/SupportPackage";

// define the WhisprMainView component props
export interface WhisprMainViewProps {
    chosenView?: string;
}

const WhisprMainView = () => {

    const { chosenView } = useContext(SupportPackageContext);
    const [view, setView] = React.useState<string | null>(null);
    const [displayAsJson, setDisplayAsJson] = React.useState<boolean>(false);

    useEffect(() => {
        setDisplayAsJson(chosenView?.endsWith(' [json]') ?? false);
        setView(displayAsJson ? chosenView?.slice(0, -7) ?? null : chosenView ?? null);
    });

    // If the chosen view is:
    // "<Analsys>" - show the <AnalysisViewer> component
    // "<All logs>" - show the <FilteredLogViewer> component
    // "<filename> [json]" - show the <JsonViewer> component
    // "<filename>" - show the <LogViewer> component
    // otherwise show nothing

    return (
        <div className="grid">
            <div className="col-12" style={{ height: "calc(100vh - 200px)" }}>
                { chosenView == "<Analysis>" ?
                    (
                       <Analysis/>
                    ) 
                  : chosenView == "<All logs>" ?
                    (
                       <div>
                        <p>This is the all logs view</p>
                       </div>
                    )
                  : chosenView ?
                    displayAsJson ?
                    (
                        <JsonViewer filename={view ?? undefined}/>
                    ) : (
                        <LogViewer filename={view ?? undefined}/>
                    )
                : (
                    <div>
                    <p>This is the all logs view</p>
                   </div>
              )}
            </div>            
        </div>
    );
    


};

export default WhisprMainView;