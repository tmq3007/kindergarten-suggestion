'use client';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {FolderOpenOutlined, HomeOutlined, LeftOutlined, RightOutlined} from '@ant-design/icons';
import {Button, ConfigProvider, Layout, Menu} from 'antd';
import Link from 'next/link';
import {forbidden, unauthorized} from 'next/navigation';
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
                                    items={[
                                        {key: '1', icon: <HomeOutlined/>, label: <Link href="">My School</Link>},
                                        {key: '2', icon: <FolderOpenOutlined/>,
                                            label: <Link href="/public/school-owner/school-draft">My Draft</Link>},
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
                    style={{padding: 20, minHeight: 280, paddingTop: 90}}
                >
                    {children}
                </Content>
            </Layout>
        </Fragment>
    );
}