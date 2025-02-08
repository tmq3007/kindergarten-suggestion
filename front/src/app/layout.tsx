import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import StoreProvider, {props} from "@/redux/StoreProvider";


export const metadata: Metadata = {
    title: "Kindergarten Suggestion System",
    description: "Website for parent to find ideal kindergarten",
};

export default function RootLayout({children}: props) {
    return (
        <html lang="en">
        <body>
        <StoreProvider>
            {children}
        </StoreProvider>
        </body>
        </html>
    );
};
