/* eslint-disable @next/next/no-img-element */

import React from 'react';
import AppMenuitem from './AppMenuitem';
import { AppMenuItem } from '@/types';
import { MenuProvider } from './context/menucontext';

const AppMenu = () => {

    const model: AppMenuItem[] = [
        {
            label: 'Menu',
            items: [
                // { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
                { label: 'Upload', icon: 'pi pi-fw pi-upload', to: '/pages/upload' },
                { label: 'File Viewer', icon: 'pi pi-fw pi-file', to: '/pages/file_viewer' },
                { label: 'Logs Viewer', icon: 'pi pi-fw pi-filter', to: '/pages/file_viewer' }        
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
                
                {/* <Link href="https://blocks.primereact.org" target="_blank" style={{ cursor: 'pointer' }}>
                    <img alt="Prime Blocks" className="w-full mt-3" src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`} />
                </Link> */}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
