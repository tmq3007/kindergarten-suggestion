import type {Metadata} from "next";
import StoreProvider, {Props} from "@/redux/StoreProvider";
import HeaderHome from "@/app/(public)/component/HeaderHome";


export const metadata: Metadata = {
    title: "Kindergarten Suggestion System",
    description: "Website for parent to find ideal kindergarten",
};

export default function RootLayout({children}: Props) {
    return (
        <html lang="en">
        <body>
        <StoreProvider>
            <HeaderHome/>
             {children}
         </StoreProvider>
        </body>
        </html>
    );
};
