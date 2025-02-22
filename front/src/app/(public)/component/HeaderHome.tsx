'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserOutlined } from '@ant-design/icons';
import {ConfigProvider, Menu } from 'antd';

const Navbar: React.FC = () => {
    return (
        <nav className="sticky top-0 bg-white shadow-md z-50">
            <div className="flex items-center justify-between px-8 py-3">
                {/* Logo */}
                <div className="flex items-center">
                    <Image
                        src="/logo2-removebg-preview.png"
                        alt="Best School Logo"
                        width={50}
                        height={50}
                    />
                </div>
                <ConfigProvider
                    theme={{
                        components: {
                            Menu: {
                                itemColor:'#000',
                                itemHoverColor:'#2764EB',
                                itemActiveBg:'#2764EB'
                            },
                        },
                    }}
                >
                    <Menu
                        mode="horizontal"
                        className="border-none text-lg bg-transparent flex gap-6"
                        items={[
                            {
                                label: <Link href="/view-account" className="text-blue-500 font-semibold">School Search</Link>,
                                key: 'school',
                            },
                            {
                                label: <Link href="/community" className="text-blue-500">Community</Link>,
                                key: 'community',
                            },
                            {
                                label: <Link href="/about" className="text-blue-500">About Us</Link>,
                                key: 'about',
                            },
                        ]}
                    />
                </ConfigProvider>



                {/* Login & Signup */}
                <div className="flex items-center space-x-4 text-blue-500">
                    <UserOutlined className="text-xl" />
                    <Link href="/login" className="hover:underline">Login</Link>
                    <span>|</span>
                    <Link href="/signup" className="hover:underline">Sign Up</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
