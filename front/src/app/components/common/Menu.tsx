import React from 'react';
import {
    AppstoreOutlined,
    BellOutlined,
    HomeOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        title: "MENU",
        items: [
            { key: "1", href: "/admin/schoolmanagement", icon: <HomeOutlined />, label: "School Management" },
            { key: "2", href: "/admin/create-user", icon: <UserOutlined />, label: "User Management" },
            { key: "3", href: "/admin/reminder", icon: <BellOutlined />, label: "Reminder" },
            { key: "4", href: "/admin/parentmanagement", icon: <TeamOutlined />, label: "Parent Management" },
            { key: "5", href: "/admin/requestmanagement", icon: <AppstoreOutlined />, label: "Request Management" },
        ],
    },
];

const Menu = ({ collapsed }: { collapsed: boolean }) => {
    const pathname = usePathname(); // Lấy đường dẫn hiện tại để xác định mục nào đang được chọn

    return (
        <div className="mt-4 text-sm">
            {menuItems.map((section) => (
                <div className="flex flex-col gap-2" key={section.title}>
                    {/* Ẩn title khi collapsed */}
                    {!collapsed && (
                        <span className="text-gray-400 font-light my-4 px-2">
                            {section.title}
                        </span>
                    )}

                    {section.items.map((item) => {
                        const isActive = pathname === item.href; // Kiểm tra mục đang active

                        return (
                            <Link
                                href={item.href}
                                key={item.key}
                                className={`flex items-center gap-4 text-gray-500 py-2 px-2 rounded-md transition-all
                                    ${collapsed ? "justify-center" : "lg:justify-start"}
                                    ${
                                    isActive
                                        ? "bg-[#E3F2FD] text-blue-600 font-semibold"
                                        : "hover:bg-[#E3F2FD] hover:text-blue-600"
                                }`}
                            >
                                {item.icon}
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Menu;
