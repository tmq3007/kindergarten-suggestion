'use client';
import React, {useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {InfoCircleOutlined, PartitionOutlined, SearchOutlined, UserOutlined} from '@ant-design/icons';
import {ConfigProvider, Menu, Modal, Space} from 'antd';
import {usePathname} from "next/navigation";
import clsx from "clsx";
import RegisterForm from "@/app/components/RegisterForm";
import ParentLoginForm from "@/app/components/ParentLoginForm";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import UserDropdown from "@/app/components/UserDropdown";
import {motion} from 'framer-motion'

export default function HomeHeader() {
    const path = usePathname();
    const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    if (path === '/public/login') {
        return null;
    }
    const username = useSelector((state: RootState) => state.user?.username);
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }} // Header bắt đầu từ vị trí trên và mờ dần
            animate={{ y: 0, opacity: 1 }} // Hiệu ứng cuộn từ trên xuống 0px
            transition={{
                duration: 1, // Thời gian tổng thể của hiệu ứng
                ease: "easeInOut", // Kiểu chuyển động
                opacity: { duration: 1.5, ease: "easeInOut" }, // Tùy chỉnh riêng cho opacity
            }}
            className="sticky top-0 bg-cyan-100 shadow-md z-10">
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
                {
                    username ?
                        <UserDropdown username={username}/> :
                        <Space>
                            <Link href=""
                                  onClick={() => setIsLoginModalOpen(true)}
                            >
                                <Space>
                                    <UserOutlined/>
                                    Login
                                </Space>
                            </Link>
                            <span>|</span>
                            <Link href={""}
                                  onClick={() => setIsSignupModalOpen(true)}
                                  className="pr-4"
                            >
                                Sign Up
                            </Link>
                        </Space>
                }
            </div>

            {/*Login Modal*/}
            <Modal
                title={<div className={'text-center text-2xl'}>Login into your account</div>}
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
                    }}/>
            </Modal>

            {/*Signup Modal*/}
            <Modal
                title={<div className={'text-center text-2xl'}>Create a new user</div>}
                open={isSignupModalOpen}
                onOk={() => setIsSignupModalOpen(false)}
                onCancel={() => setIsSignupModalOpen(false)}
                centered
                footer={null}
                destroyOnClose={true}
            >
                <RegisterForm onCancel={() => setIsSignupModalOpen(false)}/>
            </Modal>
        </motion.nav>
    );
};

