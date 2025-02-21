import type {Metadata} from "next";
import "./globals.css";
import StoreProvider, {Props} from "@/redux/StoreProvider";
import Footer from "@/app/home/components/Footer";


export const metadata: Metadata = {
    title: "Kindergarten Suggestion System",
    description: "Website for parent to find ideal kindergarten",
};

export default function RootLayout({children}: Props) {
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
