import type {Metadata} from "next";
import {Props} from "@/redux/StoreProvider";
import HomeHeader from "@/app/components/HomeHeader";


export const metadata: Metadata = {
    title: "Kindergarten Suggestion System",
    description: "Website for parent to find ideal kindergarten",
};

export default function RootLayout({children}: Props) {
    return (
        <>
            <HomeHeader/>
            {children}
        </>
    );
};
