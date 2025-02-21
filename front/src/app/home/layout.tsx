import type {Metadata} from "next";
import StoreProvider, {Props} from "@/redux/StoreProvider";
import Header from "@/app/home/components/Header";
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
            <Header/>
            {children}
            <Footer/>
        </StoreProvider>
        </body>
        </html>
    );
};
