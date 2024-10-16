'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import StoreProvider from '../app/StoreProvider'
import React from 'react';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/whispr/themes/lara-dark-teal/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <React.StrictMode>
                    <PrimeReactProvider>
                    <StoreProvider>                
                    <LayoutProvider>
                            {children}
                    </LayoutProvider>
                    </StoreProvider>
                    </PrimeReactProvider>
                </React.StrictMode>
            </body>
        </html>
    );
}
