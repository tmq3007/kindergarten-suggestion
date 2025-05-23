'use client';
import React, {useEffect, useRef, useState} from 'react';
import logo from '@public/KSS.png';
import {
    BellOutlined, FolderOpenOutlined,
    HomeOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined, PaperClipOutlined, RetweetOutlined, TeamOutlined,
    UsergroupAddOutlined,
    UserOutlined,
    WindowsOutlined,
} from '@ant-design/icons';
import {Button, ConfigProvider, Drawer, DrawerProps, Layout, Menu, message, Modal, Space, theme} from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import {useLogoutMutation} from '@/redux/services/authApi';
import {forbidden, unauthorized, usePathname, useRouter} from 'next/navigation';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/redux/store';
import {ROLES} from '@/lib/constants';
import {resetUser} from '@/redux/features/userSlice';
import {Resizable} from 'react-resizable';
import 'react-resizable/css/styles.css'
import Footer from '@/app/components/common/Footer';
import NotificationDropdown from "@/app/components/user/NotificationDropdown";

export default function AdminLayout({children}: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [messageApi, contextHolder] = message.useMessage();
    const [collapsed, setCollapsed] = useState(false);
    const {Header, Content, Sider} = Layout;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [logout] = useLogoutMutation();
    const processed = useRef(false);
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const role = user.role;
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState<DrawerProps['placement']>('left');

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    let selectedKeys = ['1'];
    if (pathname.startsWith('/admin/management/user/user-list')) {
        selectedKeys = ['2'];
    } else if (pathname.startsWith('/admin/management/reminder/request-reminder')) {
        selectedKeys = ['3'];
    } else if (pathname.startsWith('/admin/management/parent/parent-list')) {
        selectedKeys = ['4'];
    } else if (pathname.startsWith('/admin/management/request/request-list')) {
        selectedKeys = ['5'];
    }

    if (!role) {
        unauthorized();
    }
    // Check role, but skip if logging out
    const isLoggingOut = useRef(false);
    useEffect(() => {
        if (role !== ROLES.ADMIN && !isLoggingOut.current) {
            forbidden();
        }
    }, [role]);

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const handleLogout = async () => {

        messageApi.success("Logging out...")

        try {
            setIsModalOpen(false);
            isLoggingOut.current = true; // Mark as on logout process

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
            }
        } catch (error) {
            console.error("Logout failed:", error);
            dispatch(resetUser());
        }
    };

    const [siderWidth, setSiderWidth] = useState(200); // Chiều rộng ban đầu
    const onResize = (event: any, {size}: { size: { width: number; height: number } }) => {
        setSiderWidth(size.width);
    };

    return (
        <div className={'min-h-screen'}>
            {contextHolder}
            <Button
                type="primary"
                onClick={showDrawer}
                className="md:hidden fixed top-16 -left-6 z-50 pl-8 pr-2 bg-blue-500 text-white rounded-xl"
            >
                Menu
            </Button>
            <Drawer
                title="Admin"
                placement={placement}
                closable={true}
                onClose={onClose}
                open={open}
                key={placement}
            >
                <Menu
                    className={'w-full !border-0'}
                    theme="light"
                    selectedKeys={selectedKeys}
                    items={[
                        {
                            key: '1',
                            icon: <HomeOutlined/>,
                            label: <Link href="/admin/management/school/school-list">School
                                Management</Link>,
                        },
                        {
                            key: '2',
                            icon: <UserOutlined/>,
                            label: <Link href="/admin/management/user/user-list">User Management</Link>,
                        },
                        {
                            key: '3',
                            icon: <BellOutlined/>,
                            label: <Link href="/admin/management/reminder/request-reminder">Reminder</Link>,
                        },
                        {
                            key: '4',
                            icon: <UsergroupAddOutlined/>,
                            label: <Link href="/admin/management/parent/parent-list">Parent Management</Link>,
                        },
                        {
                            key: '5',
                            icon: <WindowsOutlined/>,
                            label: <Link href="/admin/management/request/request-list">Request Management</Link>,
                        },
                    ]}
                />
            </Drawer>
            <Layout className={'min-h-screen'}>
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

                    <Resizable
                        width={siderWidth}
                        height={Infinity}
                        onResize={onResize}
                        minConstraints={[200, Infinity]} // Chiều rộng tối thiểu
                        maxConstraints={[350, Infinity]} // Chiều rộng tối đa
                        handle={
                            <div
                                className="react-resizable-handle"
                                style={{
                                    width: '10px',
                                    height: '100%',
                                    background: 'transparent',
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    cursor: 'ew-resize',
                                    zIndex: 1,
                                }}
                            />
                        }
                        className="hidden md:block"
                    >
                        <Sider width={siderWidth}
                               trigger={null}
                               collapsible
                               collapsed={collapsed}
                        >
                            <Image className={'mx-auto'} src={logo} alt={'logo'} height={70} width={70}/>
                            <div className="demo-logo-vertical"/>
                            <Menu
                                theme="dark"
                                mode="inline"
                                selectedKeys={selectedKeys}
                                items={[
                                    {
                                        key: '1',
                                        icon: <HomeOutlined/>,
                                        label: <Link href="/admin/management/school/school-list">School
                                            Management</Link>,
                                    },
                                    {
                                        key: '2',
                                        icon: <UserOutlined/>,
                                        label: <Link href="/admin/management/user/user-list">User Management</Link>,
                                    },
                                    {
                                        key: '3',
                                        icon: <BellOutlined/>,
                                        label: <Link href="/admin/management/reminder/request-reminder">Reminder</Link>,
                                    },
                                    {
                                        key: '4',
                                        icon: <UsergroupAddOutlined/>,
                                        label: <Link href="/admin/management/parent/parent-list">Parent Management</Link>,
                                    },
                                    {
                                        key: '5',
                                        icon: <WindowsOutlined/>,
                                        label: <Link href="/admin/management/request/request-list">Request Management</Link>,
                                    },
                                ]}
                            />
                        </Sider>
                    </Resizable>
                </ConfigProvider>
                <Layout>
                    <Header
                        className={'flex justify-between items-center px-2'}
                        style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1000,
                            width: '100%',
                            background: colorBgContainer,
                        }}
                    >
                        <Button
                            className={'hidden md:block'}
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
                        <Space className={'md:hidden flex justify-evenly w-full h-full'}>
                            <Link href="/admin/management/school/school-list">
                                <HomeOutlined/>
                            </Link>
                            <Link href="/admin/management/user/user-list">
                                <UserOutlined/>
                            </Link>
                            <Link href="/admin/management/reminder/request-reminder">
                                <RetweetOutlined />
                            </Link>
                            <Link href="/admin/management/parent/parent-list">
                                <UsergroupAddOutlined/>
                            </Link>
                            <Link href="/admin/management/request/request-list">
                                <WindowsOutlined/>
                            </Link>
                            <NotificationDropdown />
                             <Link className={"text-red-500"} href="" onClick={() => setIsModalOpen(true)}>
                                <LogoutOutlined/>
                            </Link>

                        </Space>
                        <Space className="hidden md:flex text-sm items-center gap-4">
                            <NotificationDropdown />
                            <Button
                                type="text"
                                icon={<LogoutOutlined/>}
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
                        </Space>

                    </Header>
                    <Content
                        className='rounded-lg overflow-auto'
                        style={{
                            padding: 15,
                            minHeight: `calc(100vh - 70px)`,
                        }}
                    >
                        {children}
                    </Content>
                    <Footer/>
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
                    getContainer={false}
                >
                    <p>Are you sure you want to logout? All your unsaved data will be lost.</p>
                </Modal>
            </Layout>
        </div>
    );
}