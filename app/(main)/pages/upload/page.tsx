'use client';

import React, { useRef, useState, useContext } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload, FileUploadHeaderTemplateOptions, FileUploadSelectEvent, FileUploadHandlerEvent} from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { SupportPackageContext } from '../../../api/SupportPackage';

export default function UploadSupportPackage() {
    const toast = useRef<Toast>(null);
    const [totalSize, setTotalSize] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);
    const supportPackage = useContext(SupportPackageContext);

    const onTemplateSelect = (e: FileUploadSelectEvent) => {
        let file = e.files[0];
        setTotalSize(file.size);

        console.log('File Selected: ', file);

        // check that the file is a tarball
        if (file.name.split('.').pop() !== 'tgz') {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Please upload a .tgz file' });
            return;
        }

        supportPackage.uploadSupportPackage(file).then(() => {
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Support Package Uploaded' });
        }).catch((error) => {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Support Package Upload Failed' });
        }).finally(() => {
            fileUploadRef.current?.clear();
            setTotalSize(0);
        });
    };

    const onTemplateClear = () => {
        setTotalSize(0);
    };

    const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
        const { className, chooseButton, uploadButton } = options;
        const value = totalSize / 10000;
        const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                {uploadButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{formatedValue} / 1 MB</span>
                    <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
                </div>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Drag and Drop WiserHome Support Packages Here
                </span>
            </div>
        );
    };

    const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' };
    const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

    return (
        <div>
            <Toast ref={toast}></Toast>

            <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
            <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
            <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

            <FileUpload ref={fileUploadRef} 
                // url="/api/upload" 
                customUpload
                accept="*.tgz" 
                maxFileSize={10000000} // 10MB
                // onUpload={onTemplateUpload} 
                onSelect={onTemplateSelect} 
                onError={onTemplateClear} 
                onClear={onTemplateClear}
                headerTemplate={headerTemplate} 
                // itemTemplate={itemTemplate} 
                emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions} 
                uploadOptions={uploadOptions} 
                cancelOptions={cancelOptions} />
        </div>
    )
}
        

// const FileDemo = () => {
//     const toast = useRef<Toast | null>(null);

//     const onUpload = () => {
//         toast.current?.show({
//             severity: 'info',
//             summary: 'Success',
//             detail: 'File Uploaded',
//             life: 3000
//         });
//     };

//     return (
//         <div className="grid">
//             <Toast ref={toast}></Toast>
//             <div className="col-12">
//                 </div>                    
//                     <h5>Advanced</h5>
//                     <FileUpload name="demo[]" url="/api/upload" onUpload={onUpload} multiple accept="image/*" maxFileSize={1000000} />

//                     <h5>Basic</h5>
//                     <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" maxFileSize={1000000} onUpload={onUpload} />
//                 </div>
//             </div>
//         </div>
//     );
// };
