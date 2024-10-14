'use client';
import React, { useState, useEffect, useContext } from 'react';
import { TreeTable, TreeTableSelectionKeysType } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import UploadSupportPackage from './UploadSupportPackage';
import { SupportPackageContext, SupportPackageProps } from '../../../api/SupportPackage';

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

function GenerateTableDataFromSupportPackage(sp: SupportPackageProps): TreeNode[] {
    const files: TreeNode[] = [];
    Array.from(sp.files.entries()).forEach(([filename, content]) => {
        const node: TreeNode = {
            key: filename,
            data: {
                name: filename,
                size: GetPrettyFileSize(content.length),
                type: GetFileTypeFromFilename(filename)
            }
        };
        files.push(node);        
    });
    return files;
}

const UploadPage = () => {
    const [files2, setFiles2] = useState<TreeNode[]>([]);
    const [selectedFileKeys2, setSelectedFileKeys2] = useState<TreeTableSelectionKeysType | null>(null);
    const SupportPackage = useContext(SupportPackageContext);

    const onUploadComplete = () => {
        setFiles2(GenerateTableDataFromSupportPackage(SupportPackage));
    };

    useEffect(() => {
        console.log("SupportPackage.updateCounter: ", SupportPackage.updateCounter);
    }, [SupportPackage.updateCounter]);

    return (
        <div className="grid">
            <div className="col-12">
                <UploadSupportPackage onUploadComplete={onUploadComplete}/>
            </div>
            <div className="col-12">
                <div className="card">
                    <h5>Support Package Analysis</h5>
                    <TreeTable value={files2}>
                        <Column field="name" header="Name" expander />
                        <Column field="size" header="Size" />
                        <Column field="type" header="Type" />
                    </TreeTable>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;