/* eslint-disable @next/next/no-img-element */

import React, { useContext, useState, useEffect } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';
import { SupportPackageContext, SupportPackageProps } from '@/app/api/SupportPackage';

function GenerateOtherFilesMenu(sp: SupportPackageProps): AppMenuItem[] {
    const otherFiles: AppMenuItem[] = [];

    sp.files.forEach((_, filename) => {
        if (!filename.endsWith('.log')) {
            otherFiles.push({
                label: filename,
                icon: 'pi pi-fw pi-file',
                to: `/uikit/file`
            });
        }
    });

    return otherFiles;
}

function GenerateMenuFromSupportPackage(sp: SupportPackageProps): AppMenuItem[] {
    let menu = Array<AppMenuItem>();

    // We always have a home menu item
    menu.push({
        label: 'Menu',
        items: [
            // { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Upload', icon: 'pi pi-fw pi-upload', to: '/pages/upload' },
            { label: 'File Viewer', icon: 'pi pi-fw pi-file', to: '/pages/file_viewer' },
            { label: 'Logs Viewer', icon: 'pi pi-fw pi-filter', to: '/uikit/misc' }        
        ]
    });

    return menu;
}


const AppMenu = () => {
    const [model, setModel] = useState<AppMenuItem[]>([]);
    const [menu, setMenu] = useState<JSX.Element[]>([]);
    const SupportPackage = useContext(SupportPackageContext);

    useEffect(() => {
        console.log("SupportPackage.updateCounter: ", SupportPackage.updateCounter);
        setModel(GenerateMenuFromSupportPackage(SupportPackage));
    }, [SupportPackage.updateCounter]);

    function GenerateMenu(): JSX.Element[] {
        return model.map((item, i) => {
            return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
        });
    }

    useEffect(() => {
        setMenu(GenerateMenu());
    }, [model]);

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {GenerateMenu()}
                {/* <Link href="https://blocks.primereact.org" target="_blank" style={{ cursor: 'pointer' }}>
                    <img alt="Prime Blocks" className="w-full mt-3" src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`} />
                </Link> */}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
