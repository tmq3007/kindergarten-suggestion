import type {Metadata} from "next";
import {Props} from "@/redux/StoreProvider";

export const metadata: Metadata = {
    title: "Kindergarten Suggestion System",
    description: "Website for parent to find ideal kindergarten",
};

export default function RootLayout({children}: Props) {
    return (
        <div className={'min-h-screen'}>
            {children}
        </div>
    );
};
