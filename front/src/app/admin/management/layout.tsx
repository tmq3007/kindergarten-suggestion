'use client'
import React, {Children, useState} from 'react';
import logo from '@public/logo2.png';
import {
    BellOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UsergroupAddOutlined,
    UserOutlined,
    WindowsOutlined,
} from '@ant-design/icons';
import {Button, ConfigProvider, Layout, Menu, Space, theme} from 'antd';
import Image from "next/image";

const {Header, Sider, Content} = Layout;

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    return (
        <Layout className={'h-screen'}>
            <ConfigProvider
                theme={{
                    components: {
                        Layout: {
                            siderBg: '#E2FFF8',
                        },
                        Menu: {
                            iconSize: 20,
                            itemSelectedColor: 'red'
                        }
                    },
                }}
            >
                <Sider className={'hidden md:block'} trigger={null} collapsible collapsed={collapsed}>
                    <Image className={'mx-auto'} src={logo} alt={'logo'} height={70} width={70}/>
                    <div className="demo-logo-vertical"/>
                    <Menu
                    className={'bg-custom'}
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
                    {
                    key: '1',
                    icon: <HomeOutlined/>,
                    label: 'School Management',
                    },
                    {
                    key: '2',
                    icon: <UserOutlined/>,
                    label: 'User Management',
                    },
                    {
                    key: '3',
                    icon: <BellOutlined/>,
                    label: 'Reminder',
                    },
                    {
                    key: '4',
                    icon: <UsergroupAddOutlined/>,
                    label: 'Parent Management',
                    },
                    {
                    key: '5',
                    icon: <WindowsOutlined/>,
                    label: 'Request Management',
                    },
                    ]}
                    />
                </Sider>

            </ConfigProvider>
            <Layout>
                <Header className={'flex'} style={{padding: 0, background: colorBgContainer}}>
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
                        <HomeOutlined/>
                        <UserOutlined/>
                        <BellOutlined/>
                        <UsergroupAddOutlined/>
                        <WindowsOutlined/>
                    </Space>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    
                </Content>
            </Layout>
        </Layout>
    );
};

