'use client';
import React, {useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {InfoCircleOutlined, PartitionOutlined, SearchOutlined, UserOutlined} from '@ant-design/icons';
import {ConfigProvider, Menu, Modal, Space} from 'antd';
import {usePathname} from "next/navigation";
import clsx from "clsx";
import RegisterForm from "@/app/components/user/RegisterForm";
import ParentLoginForm from "@/app/components/user/ParentLoginForm";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import UserDropdown from "@/app/components/user/UserDropdown";
import {motion} from 'framer-motion'
import {useGetCountriesQuery} from '@/redux/services/registerApi';


export default function Header() {
    const path = usePathname();
    const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const { data: countries, isLoading: isLoadingCountry, error } = useGetCountriesQuery();

    if (path === '/public/login') {
        return null;
    }
    const username = useSelector((state: RootState) => state.user?.username);
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                duration: 1,
                ease: "easeInOut",
                opacity: { duration: 2, ease: "easeInOut" },
            }}
            className="fixed w-full top-0 bg-custom text-white shadow-md z-10">
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
                            className="border-none text-lg bg-transparent"
                            items={[
                                {
                                    label: <Link
                                        href="/public"
                                        className={clsx(
                                            path === '/public' && 'font-bold !text-custom-200',
                                        )}>
                                        <span className={'hidden md:block text-white'}>School Search</span>
                                        <SearchOutlined className={'md:hidden text-white'}/>
                                    </Link>,
                                    key: 'school',
                                },
                                {
                                    label: <Link
                                        href="/public/community"
                                        className={clsx(
                                            path === '/public/community' && 'font-bold !text-custom-200',
                                        )}>
                                        <span className={'hidden md:block text-white'}>Community</span>
                                        <PartitionOutlined className={'md:hidden text-white'}/>
                                    </Link>,
                                    key: 'community',
                                },
                                {
                                    label: <Link
                                        href="/public/about"
                                        className={clsx(
                                            path === '/public/about' && 'font-bold !text-custom-200',
                                        )}>
                                        <span className={'hidden md:block text-white'}>About Us</span>
                                        <InfoCircleOutlined className={'md:hidden text-white'}/>
                                    </Link>,
                                    key: 'about',
                                },
                            ]}
                        />
                    </ConfigProvider>
                </div>


                 {/*Login & Signup*/}
                {
                    username ?
                        <UserDropdown username={username}/> :
                        <Space className={'text-sm md:text-lg'}>
                            <Link href=""
                                  onClick={() => setIsLoginModalOpen(true)}
                            >
                                <Space>
                                    <UserOutlined className={'text-sm md:text-xl'}/>
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
                getContainer={false}
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
                getContainer={false}
            >
                <RegisterForm onSuccess={()=> {
                    setIsLoginModalOpen(true); 
                    setIsSignupModalOpen(false)}} 
                    countries={countries} isLoadingCountry={isLoadingCountry} onCancel={() => setIsSignupModalOpen(false)}/>
            </Modal>
        </motion.nav>
    );
};

