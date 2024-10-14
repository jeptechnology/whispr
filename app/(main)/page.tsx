'use client';

import React from "react";
import LogViewer from "../components/LogViewer"; // For log files
import JsonViewer from "../components/JsonViewer"; // For json files
import Analysis from "../components/Analysis";

// define the WhisprMainView component props
export interface WhisprMainViewProps {
    chosenView?: string;
}

const WhisprMainView = (props: WhisprMainViewProps ) => {

    const displayAsJson = props.chosenView?.endsWith(' [json]');
    const view = displayAsJson ? props.chosenView?.slice(0, -7) : props.chosenView;

    // If the chosen view is:
    // "<Analsys>" - show the <AnalysisViewer> component
    // "<All logs>" - show the <FilteredLogViewer> component
    // "<filename> [json]" - show the <JsonViewer> component
    // "<filename>" - show the <LogViewer> component
    // otherwise show nothing

    return (
        <div className="grid">
            <div className="col-12" style={{ height: "calc(100vh - 200px)" }}>
                { props.chosenView == "<Analysis>" ?
                    (
                       <Analysis/>
                    ) 
                  : props.chosenView == "<All logs>" ?
                    (
                       <div/>
                    )
                  : props.chosenView ?
                    displayAsJson ?
                    (
                        <JsonViewer filename={view}/>
                    ) : (
                        <LogViewer filename={view}/>
                    )
                : (
                    <div/>
                )}
            </div>            
        </div>
    );
    


};

export default WhisprMainView;