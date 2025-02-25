'use client';

import React from "react";
import { Breadcrumb, Tabs, Form, Input, DatePicker, Button } from "antd";
import Link from "next/link";
import { Typography } from "antd";

const { Title } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
    return (
        <div className="h-[90%]   flex flex-col p-10">
            {/* Breadcrumb */}
            <Breadcrumb

                items={[
                    {
                        title: <Link href="/">Home</Link>,
                    },
                    {
                        title: "My Profile",
                    },
                ]}
            />

            {/* Title */}
            <Title level={3} className="my-2">My Profile</Title>

            {/* Tabs */}
            <div className="flex-grow items-center justify-center flex flex-col">
                <Tabs
                    defaultActiveKey="1"
                    type="card"
                    size="small"
                    centered
                    className="flex-grow max-w-md flex flex-col"
                    items={[
                        {
                            key: "1",
                            label: "My Information",
                            children: (
                                <Form layout="vertical" className="h-full flex flex-col">
                                    <div className="grid grid-cols-2 gap-4 flex-grow">
                                        {/* Left Column */}
                                        <div className="flex flex-col">
                                            <Form.Item className={'mb-2'} label="Full Name">
                                                <Input placeholder="Nguyễn Hoàng Anh" />
                                            </Form.Item>
                                            <Form.Item className={'mb-2'} label="Email Address">
                                                <Input placeholder="info@sys.com" />
                                            </Form.Item>
                                            <Form.Item className={'mb-2'} label="Address">
                                                <Input placeholder="City/Province" />
                                                <Input placeholder="District" className="mt-2" />
                                                <Input placeholder="Ward" className="mt-2" />
                                                <Input placeholder="House Number, Street" className="mt-2" />
                                            </Form.Item>
                                        </div>
                                        {/* Right Column */}
                                        <div className="flex flex-col">
                                            <Form.Item className={'mb-2'} label="Date of Birth">
                                                <DatePicker style={{ width: "100%" }} />
                                            </Form.Item>
                                            <Form.Item className={'mb-2'} label="Mobile No.">
                                                <Input placeholder="+91 - 66595 55000" />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <Form.Item className="mb-10 mt-3 justify-items-center">
                                        <Button type="primary" htmlType="submit">Save</Button>
                                        <Button className="ml-2">Cancel</Button>
                                    </Form.Item>
                                </Form>
                            ),
                        },
                        {
                            key: "2",
                            label: "Change Password",
                            children: (
                                <Form layout="vertical" className="h-full flex flex-col">
                                    <div className="flex-grow">
                                        <Form.Item label="Current Password">
                                            <Input.Password className={'mb-2'} style={{ width: "100%", height: "30px" }} />
                                        </Form.Item>
                                        <Form.Item label="New Password">
                                            <Input.Password className={'mb-2'} style={{ width: "100%", height: "40px" }} />
                                        </Form.Item>
                                        <Form.Item label="Confirm New Password">
                                            <Input.Password className={'mb-2'} style={{ width: "100%", height: "40px" }} />
                                        </Form.Item>
                                    </div>
                                    <Form.Item className="mt-auto">
                                        <Button type="primary" htmlType="submit">Change Password</Button>
                                    </Form.Item>
                                </Form>
                            ),
                        },
                    ]}
                />

            </div>
        </div>
    );
};

export default Profile;
