'use client'
import React, { useState } from 'react';
import logo from '@public/logo2-removebg-preview.png';
import {
    BellOutlined,
    HomeOutlined, LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UsergroupAddOutlined,
    UserOutlined,
    WindowsOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Menu, Space, theme } from 'antd';
import Image from "next/image";

const { Header, Sider, Content } = Layout;
import StoreProvider, { Props } from "@/redux/StoreProvider";
import Link from "next/link";

export default function AdminLayout({ children }: Props) {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout hasSider className={'h-screen'}> 
            <ConfigProvider
                theme={{
                    components: {
                        Layout: {},
                        Menu: {
                            iconSize: 20,
                            // itemSelectedColor: 'red'
                        }
                    },
                }}
            >
                <Sider className={'hidden md:block'} trigger={null} collapsible collapsed={collapsed}>
                    <Image className={'mx-auto'} src={logo} alt={'logo'} height={70} width={70} />
                    <div className="demo-logo-vertical" />
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={["1"]}
                        items={[
                            {
                                key: "1",
                                icon: <HomeOutlined />,
                                label: <Link href="/school-management">School Management</Link>,
                            },
                            {
                                key: "2",
                                icon: <UserOutlined />,
                                label: <Link href="/management/user/create-user">User Management</Link>,
                            },
                            {
                                key: "3",
                                icon: <BellOutlined />,
                                label: <Link href="/reminder">Reminder</Link>,
                            },
                            {
                                key: "4",
                                icon: <UsergroupAddOutlined />,
                                label: <Link href="/parent-management">Parent Management</Link>,
                            },
                            {
                                key: "5",
                                icon: <WindowsOutlined />,
                                label: <Link href="/request-management">Request Management</Link>,
                            },
                        ]}
                    />
                </Sider>
            </ConfigProvider>
            <Layout>
            <Header className={'flex justify-between items-center'}
                style={{ padding: 0, background: colorBgContainer, position: 'sticky', }}>
                <Button
                    className={'hidden md:block'}
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '16px',
                        width: 64,
                        height: 64,
                    }}
                />
                <Space className={'md:hidden flex justify-evenly w-full h-full'}>
                    <Link href="/school-management">
                        <HomeOutlined />
                    </Link>
                    <Link href="/user-management">
                        <UserOutlined />
                    </Link>
                    <Link href="/reminder">
                        <BellOutlined />
                    </Link>
                    <Link href="/parent-management">
                        <UsergroupAddOutlined />
                    </Link>
                    <Link href="/request-management">
                        <WindowsOutlined />
                    </Link>
                    <Link href="/logout">
                        <LogoutOutlined />
                    </Link>
                </Space>
                <Link className="hidden md:block" href="/logout">
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        style={{
                            fontSize: '16px',
                            width: 'auto',
                            height: 64,
                            color: 'red'
                        }}
                    >
                        Logout
                    </Button>
                </Link>
            </Header>
            <Content
                className='overflow-visible'
                style={{
                    margin: '24px 16px',
                    overflow: 'initial',
                    padding: 24,
                    minHeight: 280,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                }}
            >
                {children}
            </Content>
            </Layout>
        </Layout>

    );
};