'use client';

import React, { useContext, useEffect } from "react";
import LogViewer from "./components/LogViewer"; // For log files
import JsonViewer from "./components/JsonViewer"; // For json files
import Analysis from "./components/Analysis";
import { uploadSupportPackage, applyFilter, applyChosenView } from '@/app/api/SupportPackage';
import { SupportPackageProps } from "@/app/api/SupportPackage";
import FilePicker from "./components/FilePicker";
import UploadSupportPackage from "./components/UploadSupportPackage";
import { useAppDispatch, useAppSelector, useAppStore } from "./hooks";

// define the WhisprMainView component props
export interface WhisprMainViewProps {
    chosenView?: string;
}

const WhisprMainView = () => {

    const store = useAppStore();
    const chosenView = useAppSelector((state) => state.supportPackage.chosenView);
    const [view, setView] = React.useState<string | null>(null);
    const [displayAsJson, setDisplayAsJson] = React.useState<boolean>(false);
    const files = useAppSelector((state) => state.supportPackage.files);
    const filter = useAppSelector((state) => state.supportPackage.filter);
    const dispatch = useAppDispatch();

    useEffect(() => {
        console.log('WhisprMainView.useEffect: chosenView=', chosenView);
        setDisplayAsJson(chosenView?.endsWith(' [json]') ?? false);
        setView(displayAsJson ? chosenView?.slice(0, -7) ?? null : chosenView ?? null);
    }, [chosenView]);

    function onFileSelected(filename: string, displayAsJson: boolean) {
        
        console.log('AppTopbar.onFileSelected: filename=', filename, ' displayAsJson=', displayAsJson);
        dispatch(applyChosenView(filename));

        if (filename === 'All') {
            // if filename == "All" then clear the filter by setting files to an empty set
            dispatch(applyFilter({...filter, files: []}));
        }
        else
        {
            // if displayAsJson is true, then set the filter to display the log as JSON
            dispatch(applyFilter({...filter, files: [filename], displayAsJson}));
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
            <div className="layout-topbar">
                <span className="layout-topbar-tooltip" title="Wiser Home Integrated Support Package Reader">WHISPR</span>

                <div className="col-2">
                    <UploadSupportPackage/>
                </div>
                <div className="layout-topbar-icons">
                    <FilePicker onFileSelected={onFileSelected}/>
                </div>
            </div>
            <div className="layout-main-container">
                 <div className="layout-main">
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
            </div>
        </div>
    );
    


};

export default WhisprMainView;