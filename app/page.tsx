'use client';

import React, { useContext, useEffect } from "react";
import LogViewer from "./components/LogViewer"; // For log files
import JsonViewer from "./components/JsonViewer"; // For json files
import Analysis from "./components/Analysis";
import { useDispatch, useSelector } from 'react-redux';
import { uploadSupportPackage, applyFilter } from '@/app/api/SupportPackage';
import { SupportPackageProps } from "@/app/api/SupportPackage";
import FilePicker from "./components/FilePicker";
import UploadSupportPackage from "./components/UploadSupportPackage";
import { useAppDispatch } from "./store";

// define the WhisprMainView component props
export interface WhisprMainViewProps {
    chosenView?: string;
}

const WhisprMainView = () => {

    const chosenView = useSelector((state: SupportPackageProps) => state.chosenView);
    const [view, setView] = React.useState<string | null>(null);
    const [displayAsJson, setDisplayAsJson] = React.useState<boolean>(false);
    const files = useSelector((state: SupportPackageProps) => state.files);
    const filter = useSelector((state: SupportPackageProps) => state.filter);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setDisplayAsJson(chosenView?.endsWith(' [json]') ?? false);
        setView(displayAsJson ? chosenView?.slice(0, -7) ?? null : chosenView ?? null);
    }, [chosenView]);

    function onFileSelected(filename: string, displayAsJson: boolean) {
        
        if (filename === 'All') {
            // if filename == "All" then clear the filter by setting files to an empty set
            dispatch(applyFilter({...filter, files: new Set()}));
        }
        else
        {
            // if displayAsJson is true, then set the filter to display the log as JSON
            dispatch(applyFilter({...filter, files: new Set([filename]), displayAsJson}));
        }
    }

    // If the chosen view is:
    // "<Analsys>" - show the <AnalysisViewer> component
    // "<All logs>" - show the <FilteredLogViewer> component
    // "<filename> [json]" - show the <JsonViewer> component
    // "<filename>" - show the <LogViewer> component
    // otherwise show nothing

    return (
        <div className="grid">
            <div>
                <span className="layout-topbar-tooltip" title="Wiser Home Integrated Support Package Reader">WHISPR</span>

                <div className="col-2">
                    <UploadSupportPackage/>
                </div>
                <div className="layout-topbar-icons">
                    <FilePicker onFileSelected={onFileSelected}/>
                </div>
            </div>
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