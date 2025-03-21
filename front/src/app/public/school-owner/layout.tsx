'use client';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {
    FolderOpenOutlined,
    HomeOutlined,
    LeftOutlined, PaperClipOutlined,
    RightOutlined,
    TeamOutlined
} from '@ant-design/icons';
import {Button, ConfigProvider, Layout, Menu} from 'antd';
import Link from 'next/link';
import {forbidden, unauthorized, usePathname} from 'next/navigation';
import {useSelector} from 'react-redux';
import {RootState} from '@/redux/store';
import {ROLES} from '@/lib/constants';
import {Resizable} from 'react-resizable';
import 'react-resizable/css/styles.css';
import Sider from 'antd/es/layout/Sider';
import {Content} from 'antd/es/layout/layout';

export default function SchoolOwnerLayout({children}: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const user = useSelector((state: RootState) => state.user);
    const role = user.role;
    const hasDraft = user.hasDraft;

    if (!role) {
        unauthorized();
    }

    const isLoggingOut = useRef(false);
    useEffect(() => {
        if (role !== ROLES.SCHOOL_OWNER && !isLoggingOut.current) {
            forbidden();
        }
    }, [role]);

    const [siderWidth, setSiderWidth] = useState(250);
    const onResize = (event: any, {size}: { size: { width: number } }) => {
        setSiderWidth(size.width);
    };
    const pathname = usePathname();

    let selectedKeys = ['1'];
    if (pathname.startsWith('/public/school-owner/draft')) {
        selectedKeys = ['2'];
    } else if (pathname.startsWith('/public/school-owner/edit-school')) {
        selectedKeys = hasDraft ? ['2'] : ['1'];
    }

    return (
        <Fragment>
            <Layout>
                <ConfigProvider theme={{
                    components: {
                        Menu: {
                            iconSize: 20,
                            darkItemBg: '#002F77'
                        },
                    }
                }}>
                    <div className="relative hidden md:block">
                        <Resizable
                            width={siderWidth}
                            height={Infinity}
                            onResize={onResize}
                            minConstraints={[200, Infinity]}
                            maxConstraints={[350, Infinity]}
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
                        >
                            <Sider
                                width={siderWidth}
                                collapsed={collapsed}
                                className="pt-20 h-full bg-custom"
                            >
                                <Menu
                                    theme="dark"
                                    mode="inline"
                                    defaultSelectedKeys={['1']}
                                    selectedKeys={selectedKeys}
                                    items={[
                                        {
                                            key: '1',
                                            icon: <HomeOutlined/>,
                                            label: <Link href="/public/school-owner">My School</Link>
                                        },
                                        {
                                            key: '2',
                                            icon: <FolderOpenOutlined/>,
                                            label: <Link href="/public/school-owner/draft">My Draft</Link>
                                        },
                                        {
                                            key: '3',
                                            icon: <PaperClipOutlined />,
                                            label: <Link href="/public/school-owner/draft">My Request</Link>
                                        },
                                        {
                                            key: '4',
                                            icon: <TeamOutlined />,
                                            label: <Link href="/public/school-owner/draft">My Parents</Link>
                                        },
                                    ]}
                                />
                            </Sider>
                        </Resizable>

                        <Button
                            className="absolute top-[400px] -right-4 z-10"
                            type="primary"
                            shape="circle"
                            icon={collapsed ? <RightOutlined/> : <LeftOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    </div>
                </ConfigProvider>
                <Content
                    style={{
                        padding: 20,
                        minHeight: `calc(100vh - 70px)`,
                        paddingTop: 90,
                    }}
                    className="overflow-auto"
                >
                    {children}
                </Content>
            </Layout>
        </Fragment>
    );
}