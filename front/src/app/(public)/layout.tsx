import type {Metadata} from "next";
import StoreProvider, {Props} from "@/redux/StoreProvider";
import HeaderHome from "@/app/(public)/component/HeaderHome";
import FooterHome from "@/app/(public)/component/FooterHome";


export const metadata: Metadata = {
    title: "Kindergarten Suggestion System",
    description: "Website for parent to find ideal kindergarten",
};

export default function RootLayout({ children }: Props) {
    return (
        <html lang="en">
        <body className="min-h-screen flex flex-col">
        <HeaderHome />

        <main className="">
            {children}
        </main>

        <FooterHome />
        </body>
        </html>
    );
};
