'use client';
import React, { useEffect, useRef, useState } from 'react';
import logo from '@public/logo2-removebg-preview.png';
import {
    BellOutlined,
    HomeOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UsergroupAddOutlined,
    UserOutlined,
    WindowsOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Menu, MenuProps, message, Modal, Space, theme } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useLogoutMutation } from '@/redux/services/authApi';
import { forbidden, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ROLES } from '@/lib/constants';
import { resetUser } from '@/redux/features/userSlice';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [messageApi, contextHolder] = message.useMessage();
    const [collapsed, setCollapsed] = useState(false);
    const { Header, Content, Sider } = Layout;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const processed = useRef(false);
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    // Kiểm tra role, nhưng bỏ qua nếu đang logout
    const isLoggingOut = useRef(false);
    useEffect(() => {
        if (user.role !== ROLES.ADMIN && !isLoggingOut.current) {
            forbidden();
        }
    }, [user.role]);

    const siderStyle: React.CSSProperties = {
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
    };

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = async () => {

        messageApi.success("Logging out...")

        try {
            setIsModalOpen(false);
            isLoggingOut.current = true; // Đánh dấu là đang logout

            const result = await logout(undefined).unwrap();

            if (result?.code == 200 && !processed.current) {
                processed.current = true;

                // Perform the fetch and wait for it to complete
                await fetch('/api/logout', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                   dispatch(resetUser());
                   router.push("/admin");

            }
        } catch (error) {
            console.error("Logout failed:", error);
            messageApi.error("Logout failed. Redirect back to login").then(() => {
                dispatch(resetUser());
                router.push("/admin");
            })
        }
    };

    return (
        <>
        {contextHolder}
        <Layout hasSider>
            <ConfigProvider
                theme={{
                    components: {
                        Layout: {},
                        Menu: {
                            iconSize: 20,
                        },
                    },
                }}
            >
                <Sider style={siderStyle} className={'hidden md:block'} trigger={null} collapsible collapsed={collapsed}>
                    <Image className={'mx-auto'} src={logo} alt={'logo'} height={70} width={70} />
                    <div className="demo-logo-vertical" />
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        items={[
                            {
                                key: '1',
                                icon: <HomeOutlined />,
                                label: <Link href="/school-management">School Management</Link>,
                            },
                            {
                                key: '2',
                                icon: <UserOutlined />,
                                label: <Link href="/admin/management/user/user-list">User Management</Link>,
                            },
                            {
                                key: '3',
                                icon: <BellOutlined />,
                                label: <Link href="/reminder">Reminder</Link>,
                            },
                            {
                                key: '4',
                                icon: <UsergroupAddOutlined />,
                                label: <Link href="/parent-management">Parent Management</Link>,
                            },
                            {
                                key: '5',
                                icon: <WindowsOutlined />,
                                label: <Link href="/request-management">Request Management</Link>,
                            },
                        ]}
                    />
                </Sider>
            </ConfigProvider>
            <Layout>
                <Header
                    className={'flex justify-between items-center px-2'}
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        width: '100%',
                        background: colorBgContainer,
                    }}
                >
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
                        <Link href="" onClick={() => setIsModalOpen(true)}>
                            <LogoutOutlined />
                        </Link>
                    </Space>
                    <Link className="hidden md:block" href="">
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            style={{
                                fontSize: '16px',
                                width: 'auto',
                                height: 64,
                                color: 'red',
                            }}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Logout
                        </Button>
                    </Link>
                </Header>
                <Content
                    style={{
                        margin: '15px 10px 0px 10px',
                        padding: 20,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
            <Modal
                title="Are you leaving?"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>,
                    <Button key="logout" type="primary" danger onClick={handleLogout}>
                        Yes
                    </Button>,
                ]}
            >
                <p>Are you sure you want to logout? All your unsaved data will be lost.</p>
            </Modal>
        </Layout>
        </>

    );
}