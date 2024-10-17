'use client';
import React, { useState, useEffect, useContext } from 'react';
import { TreeTable, TreeTableSelectionKeysType } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { uploadSupportPackage, applyFilter } from '@/app/api/SupportPackage';
import { SupportPackageProps } from "@/app/api/SupportPackage";


function GetFileTypeFromFilename(filename: string): string {
    const parts = filename.split('.');
    const suffix = parts[parts.length - 1];

    if (suffix === 'tgz') {
        return 'Support Package';
    }
    else if (suffix === 'log') {
        return 'Log File';
    }
    else if (suffix === 'json') {
        return 'JSON File';
    }
    else if (suffix === 'txt') {
        return 'Text File';
    }

    return 'File';
}

function GetPrettyFileSize(size: number): string {
    if (size < 1024) {
        return size + ' B';
    }
    else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB';
    }
    else if (size < 1024 * 1024 * 1024) {
        return (size / 1024 / 1024).toFixed(2) + ' MB';
    }
    else {
        return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }
}

function GenerateTableDataFromSupportPackage(fileMap: Record<string, string>): TreeNode[] {
    const files: TreeNode[] = [];
    // for each key in the fileMap, create a TreeNode
    Object.keys(fileMap).forEach((filename) => {
        const node: TreeNode = {
            key: filename,
            data: {
                name: filename,
                size: GetPrettyFileSize(fileMap[filename]?.length),
                type: GetFileTypeFromFilename(filename)
            }
        };
        files.push(node);        
    });
    return files;
}

const Analysis = () => {
    const [files2, setFiles2] = useState<TreeNode[]>([]);
    const fileMap = useAppSelector((state) => state.supportPackage.files);
    
    useEffect(() => {
        setFiles2(GenerateTableDataFromSupportPackage(fileMap));
    }, [fileMap]);

    return (
        <div className="card">
            <h5>Support Package Analysis</h5>
            <TreeTable value={files2}>
                <Column field="name" header="Name" expander />
                <Column field="size" header="Size" />
                <Column field="type" header="Type" />
            </TreeTable>
        </div>
    );
};

export default Analysis;
