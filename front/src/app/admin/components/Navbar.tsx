'use client'
import { LogoutOutlined, MessageOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import React from "react";

interface NavbarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ collapsed, setCollapsed }) => {
    return (
        <div className="flex items-center justify-between p-2 bg-white shadow-sm">
            {/* Toggle Sidebar */}
            <button onClick={() => setCollapsed(!collapsed)} className="p-2 hidden md:flex">
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 text-xs px-2">
                <div className="text-2xl">Hello Admin</div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-6 mt-1 w-full justify-end md:w-auto md:justify-start">

            {/* Message Icon */}
                <div className="relative flex items-center justify-end cursor-pointer p-2 rounded-md hover:bg-blue-100">
                    <MessageOutlined className="text-lg" />
                    <div className="absolute -top-2 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
                        1
                    </div>
                      {/*<span className="text-gray-500 ml-2">Messages</span>*/}
                </div>

                {/* Logout luôn hiển thị */}
                <div className="flex items-center h-6 cursor-pointer p-2 rounded-md hover:bg-blue-100">
                    <LogoutOutlined className="mr-1" />
                    {/*<span className="text-[15px] text-gray-500 bg-transparent text-right">Logout</span>*/}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
