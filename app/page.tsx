'use client';

import React, { Fragment, useContext, useEffect } from "react";
import LogViewer from "./components/LogViewer"; // For log files
// import JsonViewer from "./components/JsonViewer"; // For json files
import Analysis from "./components/Analysis";
import { applyFilter, applyChosenView } from '@/app/api/SupportPackage';
import FilePicker from "./components/FilePicker";
import UploadSupportPackage from "./components/UploadSupportPackage";
import { useAppDispatch, useAppSelector } from "./hooks";
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';
import { MultiSelect } from 'primereact/multiselect';
import { SelectItem } from 'primereact/selectitem';
import LogSpeedDial from "./components/LogSpeedDial";

// define the WhisprMainView component props
export interface WhisprMainViewProps {
    chosenView?: string;
}

const WhisprMainView = () => {

    //const store = useAppStore();
    const chosenView = useAppSelector((state) => state.supportPackage.chosenView);
    const filteredLog = useAppSelector((state) => state.supportPackage.filteredLog);
    const filter = useAppSelector((state) => state.supportPackage.filter);
    const files = useAppSelector((state) => state.supportPackage.fileAnalysis);
    const dispatch = useAppDispatch();

    const isSupportPackageUploaded = Object.keys(files).length > 0;
    const isShowingLogsView = isSupportPackageUploaded && (chosenView === "<Logs>");

    ["<Summary>", "<Logs>"];

    function onViewChosen(filename: string, displayAsJson: boolean) {
        
        dispatch(applyChosenView(filename));
    }

    function applyLogFilter(logs: string[]) {
        dispatch(applyFilter({...filter, files: logs}));
    }

    function GetStartTime(): Nullable<Date> {
        if (filter.timestampStart === undefined || filter.timestampStart === null || filter.timestampStart === 0) {
            return null;
        }
        return new Date(filter.timestampStart);
    }

    function GetEndTime(): Nullable<Date> {
        if (filter.timestampEnd === undefined || filter.timestampEnd === null || filter.timestampEnd === 0) {
            return null;
        }
        return new Date(filter.timestampEnd);
    }

    function applyStartTime(date: Nullable<Date>) {
        dispatch(applyFilter({...filter, timestampStart: date?.getTime()}));        
    }

    function applyEndTime(date: Nullable<Date>) {
        dispatch(applyFilter({...filter, timestampEnd: date?.getTime()}));
    }

    function GetLogOptions(): SelectItem[] {
        let options = new Array<SelectItem>();
        
        Object.keys(files).forEach((filename) => {
            const entry = files[filename];
            if (entry.type !== 'Log File') {
                return;
            }
            options.push({label: entry.logname, value: filename});            
        });
        return options;
    }

    const logOptions = GetLogOptions();

    // If the chosen view is:
    // "<Summary>" - show the <AnalysisViewer> component
    // "<Logs>" - show the <FilteredLogViewer> component
    // "[filename]" - show the <LogViewer> component
    // otherwise show nothing

    return (
        <div className="grid">
            <div className="layout-topbar">
                <span className="layout-topbar-tooltip" title="Wiser Home Integrated Support Package Reader">WHISPR</span>

                <div className="col-3">
                    <UploadSupportPackage/>
                </div>
                <div className="col-2">
                    {
                        isSupportPackageUploaded && (
                            <div className="flex flex-wrap gap-2">
                                <FilePicker onFileSelected={onViewChosen}/>
                            </div>
                        )
                    }
                </div>
                <div className="col-3">
                    {
                        isShowingLogsView && (
                            <MultiSelect 
                            value={filter.files} 
                            onChange={(e) => applyLogFilter(e.value)} 
                            options={logOptions} 
                            // optionLabel="name" 
                            filter placeholder="Select Logs" 
                            className="w-full md:w-20rem"
                            />
                        )
                    }
                </div>
                <div className="col-5">
                    {
                        isShowingLogsView && (
                            <Fragment>
                                <Calendar id="start-time-calendar" 
                                    value={GetStartTime()} 
                                    onChange={(e) => applyStartTime(e.value)} 
                                    showTime 
                                    hourFormat="24"/>
                                <label htmlFor="end-time-calendar"> To: </label>
                                <Calendar id="end-time-calendar" value={GetEndTime()} onChange={(e) => applyEndTime(e.value)} showTime hourFormat="24" />
                            </Fragment>
                        )                        
                    }
                </div>

            </div>
            <div className="layout-main-container">
                <div className="layout-main">
                    <div className="col-12">
                            {  chosenView == "<Summary>" ?
                              (
                                <Analysis/>
                              ) 
                            : (
                                <LogViewer/>
                              )
                            }
                    </div>
                </div>                
            </div>
        </div>
    );
    


};

export default WhisprMainView;