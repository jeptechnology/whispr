import React, { useRef } from "react";
import { LazyLog } from "@melloware/react-logviewer";
import { useAppSelector, useAppDispatch } from "../hooks";
import { SpeedDial } from 'primereact/speeddial';
import { Tooltip } from 'primereact/tooltip';
import { MenuItem } from 'primereact/menuitem';
import { applyFilter, applyChosenView } from '@/app/api/SupportPackage';

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
        console.log('LogViewer.toggleColors');
        dispatch(applyFilter({...filter, colorize: !filter.colorize}))
    }

    function toggleTimestamps() {
        console.log('LogViewer.toggleTimestamps');
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
            <LazyLog 
                width={'90vw'}
                caseInsensitive
                enableHotKeys
                enableSearch
                // extraLines={1}
                text={filteredLog}                    
            />
            <div style={{ position: 'relative', height: '350px' }}>
                <Tooltip target=".speeddial-top-right .p-speeddial-action" position="left" />
                <SpeedDial model={items} direction="down" className="speeddial-top-right right-0 top-0" />
            </div>
        </div>
    );
};

export default LogViewer;
