/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '@/types';
import UploadSupportPackage from '@/app/components/UploadSupportPackage';
import FilePicker from '../app/components/FilePicker';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { applyFilter, applyChosenView } from '@/app/api/SupportPackage';
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    // const files = useAppSelector((state) => state.supportPackage.files);
    const filter = useAppSelector((state) => state.supportPackage.filter);
    const dispatch = useAppDispatch();

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    function onFileSelected(filename: string, displayAsJson: boolean) {
        
        console.log('AppTopbar.onFileSelected: filename=', filename, ' displayAsJson=', displayAsJson);

        if (filename === '<All Logs>') {
            // if filename == "All" then clear the filter by setting files to an empty set
            dispatch(applyFilter({...filter, files: []}));
        }
        else
        {
            // if displayAsJson is true, then set the filter to display the log as JSON
            dispatch(applyFilter({...filter, files: [filename], displayAsJson}));
        }

        dispatch(applyChosenView(filename));
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
        console.log('AppTopbar.setStartTime: date=', date);
        dispatch(applyFilter({...filter, timestampStart: date?.getTime()}));        
    }

    function applyEndTime(date: Nullable<Date>) {
        console.log('AppTopbar.setEndTime: date=', date);
        dispatch(applyFilter({...filter, timestampEnd: date?.getTime()}));
    }

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                {/* <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" /> */}
                <span className="layout-topbar-tooltip" title="Wiser Home Integrated Support Package Reader">WHISP</span>
            </Link>

            <div className="col-2">
                <UploadSupportPackage/>
            </div>
            <div className="col-2">
                <FilePicker onFileSelected={onFileSelected}/>
            </div>

            <div className="col-2">
                <p>Start Time</p>
                <Calendar value={GetStartTime()} onChange={(e) => applyStartTime(e.value)} showTime hourFormat="24" />
            </div>
            <div className="col-2">
                <Calendar value={GetEndTime()} onChange={(e) => applyEndTime(e.value)} showTime hourFormat="24" />
            </div>

{/*             
            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-calendar"></i>
                    <span>Calendar</span>
                </button>
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button>
                <Link href="/documentation">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                </Link>
            </div> */}
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
