import React from "react";
import { LazyLog } from "@melloware/react-logviewer";
import { useAppSelector, useAppDispatch } from "../hooks";
import { MenuItem } from 'primereact/menuitem';
import { applyFilter } from '@/app/api/SupportPackage';
import LogSpeedDial from "./LogSpeedDial";

const LogViewer = () => {
    const filteredLog = useAppSelector((state) => state.supportPackage.filteredLog);
    const filter = useAppSelector((state) => state.supportPackage.filter);
    const dispatch = useAppDispatch();

    const onClickDownload = () => {
        // Create blob link to download file
        const url = window.URL.createObjectURL(
            // crate a new blob with the file contents from files[filename]...
            new Blob([filteredLog], { type: 'application/text' })            
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            'wiser.log.txt',
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);        
    }

    function toggleColors() {
        dispatch(applyFilter({...filter, colorize: !filter.colorize}))
    }

    function toggleTimestamps() {
        dispatch(applyFilter({...filter, includeUnixTimestamp: !filter.includeUnixTimestamp}))
    }

    const items: MenuItem[] = [
        {
            label: 'Download',
            icon: 'pi pi-download',
            command: () => {
                onClickDownload();
            }
        },
        {
            label: 'Unix Timestamps',
            icon: 'pi pi-clock',
            command: () => {
                toggleTimestamps();
            }
        },
        {
            label: 'Colorise',
            icon: 'pi pi-palette',
            command: () => {
                toggleColors();
            }
        }
    ];


    return (
        <div className="col-12" style={{ height: "calc(100vh - 150px)" }}>
            <LogSpeedDial/>
            <LazyLog 
                width={'90vw'}
                caseInsensitive
                enableHotKeys
                enableSearch
                text={filteredLog}                    
            />
        </div>
    );
};

export default LogViewer;
