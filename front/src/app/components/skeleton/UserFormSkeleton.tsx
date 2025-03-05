'use client';

import React from 'react';
import { Breadcrumb, Button, Form, Skeleton, Tabs } from 'antd';
import Link from 'next/link';
import Title from 'antd/lib/typography/Title';
import { motion } from 'framer-motion';

const { TabPane } = Tabs;

const UserFormSkeleton: React.FC = () => {
    const backgroundStyle = {
        backgroundImage: `url('/bg3.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
    };

    return (
        <div className="relative min-h-screen flex flex-col p-10" style={backgroundStyle}>
            <Breadcrumb
                className="mt-[50px] ml-2.5 mb-0 text-white"
                items={[
                    { title: <Link href="/public">Home</Link> },
                    { title: 'My Profile' },
                ]}
            />
            <Title level={3} className="my-2 ml-2.5 text-white">
                My Profile
            </Title>
            <div className="flex-grow flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="w-[1000px] h-[600px] flex flex-col"
                >
                    <Tabs
                        defaultActiveKey="1"
                        type="card"
                        size="small"
                        centered
                        className="w-full h-full flex flex-col"
                        tabBarStyle={{
                            marginBottom: 0,
                            backgroundColor: 'transparent',
                            color: 'white',
                        }}
                        style={{ backgroundColor: 'transparent', border: 'none' }}
                    >
                        <TabPane tab="My Information" key="1" className="h-full w-full">
                            <Form layout="vertical" className="h-full flex flex-col p-4 overflow-auto">
                                <div className="grid grid-cols-2 gap-4 flex-grow">
                                    <div className="flex flex-col">
                                        <Form.Item name="fullname" label={<span style={{ color: 'black' }}>Full Name</span>} className="mb-10">
                                            <Skeleton.Input active={true} className="!w-full" />
                                        </Form.Item>
                                        <Form.Item name="email" label={<span style={{ color: 'black' }}>Email Address</span>} className="mb-10">
                                            <Skeleton.Input active={true} className="!w-full" />
                                        </Form.Item>
                                        <Form.Item name="province" label={<span style={{ color: 'black' }}>Province</span>} className="mb-10">
                                            <Skeleton.Input active={true} className="!w-full" />
                                        </Form.Item>
                                        <Form.Item name="district" label={<span style={{ color: 'black' }}>District</span>} className="mb-10">
                                            <Skeleton.Input active={true} className="!w-full" />
                                        </Form.Item>
                                    </div>
                                    <div className="flex flex-col">
                                        <Form.Item name="dob" label={<span style={{ color: 'black' }}>Date of Birth</span>} className="mb-10">
                                            <Skeleton.Input active={true} className="!w-full" />
                                        </Form.Item>
                                        <Form.Item name="phone" label={<span style={{ color: 'black' }}>Phone Number</span>} className="mb-10">
                                            <Skeleton.Input active={true} className="!w-full" />
                                        </Form.Item>
                                        <Form.Item name="ward" label={<span style={{ color: 'black' }}>Ward</span>} className="mb-10">
                                            <Skeleton.Input active={true} className="!w-full" />
                                        </Form.Item>
                                        <Form.Item name="street" label={<span style={{ color: 'black' }}>Street</span>} className="mb-10 h-[33px]">
                                            <Skeleton.Input active={true} className="!w-full" />
                                        </Form.Item>
                                    </div>
                                </div>
                                <Form.Item className="mb-7 mt-3 flex justify-center">
                                    <Skeleton.Button />
                                    <Skeleton.Button />
                                </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="Change Password" key="2" className="h-full" />
                    </Tabs>
                </motion.div>
            </div>
        </div>
    );
};

export default UserFormSkeleton;