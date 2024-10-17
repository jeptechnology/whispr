'use client';

import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks'; // Assuming you have this custom hook defined in your store
import { AppDispatch, RootState } from '@/app/store'; // Assuming you have these types defined in your store
import { uploadSupportPackage, applyFilter, SupportPackageProps } from '@/app/api/SupportPackage';
import { Toast } from 'primereact/toast';
import { FileUpload, FileUploadHeaderTemplateOptions, FileUploadSelectEvent, FileUploadHandlerEvent} from 'primereact/fileupload';
import { Tooltip } from 'primereact/tooltip';

export default function UploadSupportPackage() {
    const toast = useRef<Toast>(null);
    const files = useAppSelector((state) => state.supportPackage.files);
    const [totalSize, setTotalSize] = useState(0);
    const dispatch = useAppDispatch();

    interface UploadPackageThunk {
        (file: File): (dispatch: AppDispatch, getState: () => RootState) => void;
    }

    const uploadPackageThunk: UploadPackageThunk = (file: File) => (dispatch, getState) => {
        const reader = new FileReader();
        reader.onload = () => {
            // reader.result will be a base64 encoded string
            const fileContents = reader.result as string;
            dispatch(uploadSupportPackage(fileContents));
        };
        reader.readAsDataURL(file);
    };

    const onTemplateSelect = (e: FileUploadSelectEvent) => {
        let file = e.files[0];
        setTotalSize(file.size);

        console.log('File Selected: ', file);

        // check that the file is a tarball
        if (file.name.split('.').pop() !== 'tgz') {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Please upload a .tgz file' });
            return;
        }

        console.log('Support Package Uploaded: ', file.name);

        // check that the file is a tarball
        if (file.name.split('.').pop() !== 'tgz') {
           return Promise.reject('Please upload a .tgz file');      
        }

        dispatch(uploadPackageThunk(file));
    };

    return (
        <div>
            <Toast ref={toast}></Toast>

            <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
            <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
            <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

            <FileUpload 
                // url="/api/upload" 
                customUpload
                mode="basic"
                accept="*.tgz" 
                maxFileSize={10000000} // 10MB
                onSelect={onTemplateSelect}
                chooseLabel='Upload Support Package'
                />
        </div>
    )
}
        
// declare the UploadSupportPackageProps interface which will be used to pass props to the UploadSupportPackage component
// It has a callback that can be called after a file is uploaded

export interface UploadSupportPackageProps {
    onUploadComplete: () => void;
}