'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    InfoCircleOutlined,
    MenuOutlined,
    PartitionOutlined,
    SearchOutlined,
    UserAddOutlined,
    UserOutlined
} from '@ant-design/icons';
import { ConfigProvider, Menu, Modal, Space } from 'antd';
import { usePathname } from "next/navigation";
import clsx from "clsx";
import RegisterForm from "@/app/components/user/RegisterForm";
import ParentLoginForm from "@/app/components/user/ParentLoginForm";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import UserDropdown from "@/app/components/user/UserDropdown";
import { motion } from 'framer-motion';
import NotificationDropdown from "@/app/components/user/NotificationDropdown";
import logo from '@public/KSS.png';

export default function Header() {
    const path = usePathname();
    const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    if (path === '/public/login') {
        return null;
    }

    const username = useSelector((state: RootState) => state.user?.username);
    const role = useSelector((state: RootState) => state.user?.role);

    const handleScroll = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        setIsMobileMenuOpen(false);
    };

    const menuItems = [
        {
            label: <Link href="/public" onClick={(e) => { e.preventDefault(); handleScroll('school-search'); }}
                         className={clsx(path === '/public' && 'font-bold')}>
                <span className={'text-white hover:text-blue-200 transition-colors duration-300'}>School Search</span>
            </Link>,
            key: 'school',
            icon: <SearchOutlined className="text-white hover:text-blue-200 transition-colors duration-300" />,
        },
        {
            label: <Link href="/public/community" onClick={(e) => { e.preventDefault(); handleScroll('testimonial'); }}
                         className={clsx(path === '/public/community' && 'font-bold')}>
                <span className={'text-white hover:text-blue-200 transition-colors duration-300'}>Community</span>
            </Link>,
            key: 'community',
            icon: <PartitionOutlined className="text-white hover:text-blue-200 transition-colors duration-300" />,
        },
        {
            label: <Link href="/public/about" onClick={(e) => { e.preventDefault(); handleScroll('information'); }}
                         className={clsx(path === '/public/about' && 'font-bold')}>
                <span className={'text-white hover:text-blue-200 transition-colors duration-300'}>About Us</span>
            </Link>,
            key: 'about',
            icon: <InfoCircleOutlined className="text-white hover:text-blue-200 transition-colors duration-300" />,
        },
    ];
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                duration: 1,
                ease: "easeInOut",
                opacity: { duration: 2, ease: "easeInOut" },
            }}
            className="fixed w-full top-0 bg-custom text-white shadow-md z-50"
        >
            <div className="flex items-center justify-between px-4 md:px-8 py-3">
                {/* Left Section: Logo and Menu */}
                <div className="flex items-center md:!w-[80%]">
                    <Link href="/public">
                        <Image
                            className="h-10 w-10 md:h-12 md:w-12 mr-2 md:mr-4 scale-150 md:scale-[240%] cursor-pointer hover:opacity-80 transition-opacity"
                            src={logo}
                            alt="Best School Logo"
                        />
                    </Link>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex !w-[100%] ">
                        <ConfigProvider
                            theme={{
                                components: {
                                    Menu: {
                                        itemColor: 'white',
                                        horizontalItemSelectedColor: '#fff',
                                        itemHoverColor: '#bfdbfe', // Màu khi hover (blue-200)
                                        itemHoverBg: 'transparent', // Background khi hover
                                    },
                                },
                            }}
                        >
                            <Menu
                                mode="horizontal"
                                className="border-none !w-[100%] text-base bg-transparent"
                                items={menuItems}
                            />
                        </ConfigProvider>
                    </div>
                </div>

                {/* Right Section: User/Login and Mobile Menu Button */}
                <div className="flex items-center">
                    {/* Desktop User Section */}
                    <div className="hidden md:flex items-center">
                        {username ? (
                            <Space className={'flex items-center text-base'}>
                                {role === "ROLE_SCHOOL_OWNER" && <NotificationDropdown />}
                                <UserDropdown username={username} />
                            </Space>
                        ) : (
                            <Space className={'text-base flex items-center'}>
                                <Link href="" onClick={() => setIsLoginModalOpen(true)}>
                                    <Space>
                                        <UserOutlined className={'text-lg'} />
                                        Login
                                    </Space>
                                </Link>
                                <span className="mx-2">|</span>
                                <Link href="" onClick={() => setIsSignupModalOpen(true)}>
                                    <Space>
                                        <UserAddOutlined className={'text-lg'}/>
                                        Sign Up
                                    </Space>
                                 </Link>
                            </Space>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center ml-4 text-sm space-x-2">
                        {/* Mobile User Section */}

                            {username ? (
                                <Space   className="  flex items-center">
                                    {role === "ROLE_SCHOOL_OWNER" && <NotificationDropdown />}
                                    <UserDropdown username={username} />
                                </Space>
                            ) : (
                                <Space className={'text-base flex items-center'}>
                                    <Link href="" onClick={() => setIsLoginModalOpen(true)} className="block py-2">
                                        <Space>
                                            <UserOutlined />
                                            Login
                                        </Space>
                                    </Link>
                                    <Link href="" onClick={() => setIsSignupModalOpen(true)} className="block py-2">
                                        <Space>
                                            <UserAddOutlined className={'text-lg'}/>
                                            Sign Up
                                        </Space>
                                    </Link>
                                </Space>
                            )}

                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <MenuOutlined className="text-sm" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden px-4 py-2 bg-custom-900">
                    <ConfigProvider
                        theme={{
                            components: {
                                Menu: {
                                    itemColor: 'white',
                                    horizontalItemSelectedColor: '#fff',
                                    itemHoverColor: '#bfdbfe', // Màu khi hover (blue-200)
                                    itemHoverBg: 'transparent', // Background khi hover
                                },
                            },
                        }}
                    >
                        <Menu
                            mode="vertical"
                            className="border-none !w-[100%] text-base bg-transparent"
                            items={menuItems}
                        />
                    </ConfigProvider>
                </div>
            )}

            {/* Login Modal */}
            <Modal
                title={<div className={'text-center text-xl md:text-2xl'}>Login into your account</div>}
                open={isLoginModalOpen}
                onOk={() => setIsLoginModalOpen(false)}
                onCancel={() => setIsLoginModalOpen(false)}
                centered
                footer={null}
                destroyOnClose={true}
            >
                <ParentLoginForm
                    onSuccess={() => setIsLoginModalOpen(false)}
                    onCancel={() => {
                        setIsLoginModalOpen(false);
                        setIsSignupModalOpen(true);
                    }}
                />
            </Modal>

            {/* Signup Modal */}
            <Modal
                title={<div className={'text-center text-xl md:text-2xl'}>Create a new user</div>}
                open={isSignupModalOpen}
                onOk={() => setIsSignupModalOpen(false)}
                onCancel={() => setIsSignupModalOpen(false)}
                centered
                footer={null}
                destroyOnClose={true}
            >
                <RegisterForm
                    onSuccess={() => {
                        setIsLoginModalOpen(true);
                        setIsSignupModalOpen(false);
                    }}
                    onCancel={() => setIsSignupModalOpen(false)}
                />
            </Modal>
        </motion.nav>
    );
};