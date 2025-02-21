'use client';
import React, {useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {InfoCircleOutlined, PartitionOutlined, SearchOutlined, UserOutlined} from '@ant-design/icons';
import {ConfigProvider, Menu, Modal, Space} from 'antd';
import {usePathname} from "next/navigation";
import clsx from "clsx";
import RegisterForm from "@/app/components/RegisterForm";

export default function HomeHeader() {
    const path = usePathname();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    if (path === '/public/login') {
        return null;
    }
    return (
        <nav className="sticky top-0 bg-cyan-100 shadow-md z-10">
            <div className="flex items-center justify-between md:px-8 py-3">
                {/* Logo */}
                <div className="flex items-center">
                    <Image
                        className={'hidden md:block mr-4'}
                        src="/logo2-removebg-preview.png"
                        alt="Best School Logo"
                        width={50}
                        height={50}
                    />
                    <ConfigProvider
                        theme={{
                            components: {
                                Menu: {
                                    itemColor: 'black'
                                },
                            },
                        }}
                    >
                        <Menu
                            mode="horizontal"
                            className="border-none text-lg bg-transparent "
                            items={[
                                {
                                    label: <Link
                                        href="/public"
                                        className={clsx(
                                            'text-blue-500',
                                            path === '/public' && 'font-bold !text-blue-500',
                                        )}>
                                        <span className={'hidden md:block'}>School Search</span>
                                        <SearchOutlined className={'md:hidden'}/>
                                    </Link>,
                                    key: 'school',
                                },
                                {
                                    label: <Link
                                        href="/public/community"
                                        className={clsx(
                                            'text-blue-500',
                                            path === '/public/community' && 'font-bold',
                                        )}>
                                        <span className={'hidden md:block'}>Community</span>
                                        <PartitionOutlined className={'md:hidden'}/>
                                    </Link>,
                                    key: 'community',
                                },
                                {
                                    label: <Link
                                        href="/public/about"
                                        className={clsx(
                                            'text-blue-500',
                                            path === '/public/about' && 'font-bold',
                                        )}>
                                        <span className={'hidden md:block'}>About Us</span>
                                        <InfoCircleOutlined className={'md:hidden'}/>
                                    </Link>,
                                    key: 'about',
                                },
                            ]}
                        />
                    </ConfigProvider>
                </div>


                {/* Login & Signup */}
                <Space>
                    <Link href="public/login">
                        <Space>
                            <UserOutlined/>
                            Login
                        </Space>
                    </Link>
                    <span>|</span>
                    <Link href={""}
                          onClick={() => setIsModalOpen(true)}
                          className="pr-4">
                        Sign Up
                    </Link>
                </Space>
            </div>

            <Modal
                title={<div className={'text-center text-2xl'}>Create a new user</div>}
                open={isModalOpen}
                onOk={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
                centered
                footer={null}
                destroyOnClose={true}
            >
                <RegisterForm onCancel={() => setIsModalOpen(false)}/>
            </Modal>
        </nav>
    );
};

