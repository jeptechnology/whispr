'use client';
import React, { useState, useEffect } from 'react';
import { TreeTable, TreeTableSelectionKeysType } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { useAppSelector } from '@/app/hooks';
import { AnalysedLogFile } from '@/app/api/SupportPackage';
import { Button } from 'primereact/button';

function GenerateTableDataFromSupportPackage(fileMap: Record<string, AnalysedLogFile>): TreeNode[] {
    const files: TreeNode[] = [];

    // for each key in the fileMap, create a TreeNode
    Object.keys(fileMap).forEach((filename) => {

        const entry = fileMap[filename];

        const node: TreeNode = {
            key: filename,
            data: {
                name: filename,
                size: entry.size,
                type: entry.type,
                // convert the firstEntry and lastEntry to a date string
                start: entry.firstEntry == 0 ? '' : new Date(entry.firstEntry).toDateString(),
                end:   entry.lastEntry == 0 ? '' : new Date(entry.lastEntry).toDateString()
            }
        };
        files.push(node);        
    });
    return files;
}

const Analysis = () => {
    const [files2, setFiles2] = useState<TreeNode[]>([]);
    const fileMap = useAppSelector((state) => state.supportPackage.fileAnalysis);
    const files = useAppSelector((state) => state.supportPackage.files);
    
    useEffect(() => {
        setFiles2(GenerateTableDataFromSupportPackage(fileMap));
    }, [fileMap]);

    function onClickDownload(filename: string) {
        // Create blob link to download file
        const url = window.URL.createObjectURL(
            // crate a new blob with the file contents from files[filename]...
            new Blob([files[filename]], { type: 'application/text' })            
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            filename,
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);        
    }

    const actionTemplate = (data: any) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button type="button" icon="pi pi-download" rounded onClick={() => onClickDownload(data.key)}/>
            </div>
        );
    };
    
    return (
        <div className="card">
            <h5>Support Package Analysis</h5>
            <TreeTable value={files2}>
                <Column field="name"  header="Name" />
                <Column field="size"  header="Size" />
                <Column field="type"  header="Type" />
                <Column field="start" header="First Entry" />
                <Column field="end"   header="Last Entry" />
                <Column body={actionTemplate} headerClassName="w-10rem" />
            </TreeTable>
        </div>
    );
};

export default Analysis;
