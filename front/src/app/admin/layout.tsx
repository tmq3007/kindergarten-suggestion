"use client";
import Image from "next/image";
import Menu from "@/app/admin/components/Menu";
import Navbar from "@/app/admin/components/Navbar";
import { useState, useEffect } from "react";

export default function DashboardLayout({
                                            children,
                                        }: Readonly<{ children: React.ReactNode }>) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(true);
            } else {
                setCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="h-screen flex">
            {/* LEFT */}
            <div
                className={`flex flex-col ${
                    collapsed ? "w-[10%]" : "w-[24%] lg:w-[16%] xl:w-[14%]"
                } transition-all duration-300 p-4 shadow-md`}
            >
                {/* LOGO */}
                <div className="flex items-center justify-center w-full">
                    <Image
                        src="/logo.png"
                        alt="logo"
                        width={100}
                        height={60}
                        className="logo-responsive"
                    />


                </div>

                {/* MENU */}
                <div className="flex-1 mt-4">
                    <Menu collapsed={collapsed} />
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col w-full bg-[#F7F8FA] overflow-scroll">
                <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
                {children}
            </div>
        </div>
    );
}
