import type {Metadata} from "next";
import {Props} from "@/redux/StoreProvider";
import Header from "@/app/components/Header";
import Information from "@/app/components/Information";
import Footer from "@/app/components/Footer";


export const metadata: Metadata = {
    title: "Kindergarten Suggestion System",
    description: "Website for parent to find ideal kindergarten",
};

export default function RootLayout({children}: Props) {
    return (
        <>
            <Header/>
            {children}
            <Footer/>
        </>
    );
};
