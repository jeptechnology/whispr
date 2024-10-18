'use client';
import React, { useState, useEffect } from 'react';
import { TreeTable, TreeTableSelectionKeysType } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { useAppSelector } from '@/app/hooks';
import { AnalysedLogFile } from '@/app/api/SupportPackage';

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
    
    useEffect(() => {
        setFiles2(GenerateTableDataFromSupportPackage(fileMap));
    }, [fileMap]);

    return (
        <div className="card">
            <h5>Support Package Analysis</h5>
            <TreeTable value={files2}>
                <Column field="name"  header="Name" />
                <Column field="size"  header="Size" />
                <Column field="type"  header="Type" />
                <Column field="start" header="First Entry" />
                <Column field="end"   header="Last Entry" />
            </TreeTable>
        </div>
    );
};

export default Analysis;
