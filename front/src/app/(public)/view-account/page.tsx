'use client'
import React from "react";
import { Breadcrumb, Tabs, Form, Input, DatePicker, Button } from "antd";
import Link from "next/link";
import { Typography } from "antd";

const { Title } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
    return (
        <div className="h-screen flex flex-col p-6">
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
            <Title level={2} className="my-2">My Profile</Title>

            {/* Tabs */}
            <div className="  flex-grow flex flex-col">
                <Tabs
                    defaultActiveKey="1"
                    type="card"
                    size="small"
                    className="flex-grow flex flex-col "
                >
                    <TabPane tab="My Information" key="1" className="p-3 flex-grow h-[70px]">
                        <Form layout="vertical" className="h-full flex flex-col">
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                {/* Left Column */}
                                <div className="flex flex-col">
                                    <Form.Item label="Full Name">
                                        <Input placeholder="Nguyễn Hoàng Anh" />
                                    </Form.Item>
                                    <Form.Item label="Email Address">
                                        <Input placeholder="info@sys.com" />
                                    </Form.Item>
                                    <Form.Item label="Address">
                                        <Input placeholder="City/Province" />
                                        <Input placeholder="District" className="mt-2" />
                                        <Input placeholder="Ward" className="mt-2" />
                                        <Input placeholder="House Number, Street" className="mt-2" />
                                    </Form.Item>
                                </div>
                                {/* Right Column */}
                                <div className="flex flex-col">
                                    <Form.Item label="Date of Birth">
                                        <DatePicker style={{ width: "100%" }} />
                                    </Form.Item>
                                    <Form.Item label="Mobile No.">
                                        <Input placeholder="+91 - 66595 55000" />
                                    </Form.Item>
                                </div>
                            </div>
                            <Form.Item className="mt-auto">
                                <Button type="primary" htmlType="submit">Save</Button>
                                <Button className="ml-2">Cancel</Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="Change Password" key="2" className="p-3 flex-grow h-full">
                        <Form layout="vertical" className="h-full flex flex-col">
                            <div className="flex-grow">
                                <Form.Item label="Current Password">
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item label="New Password">
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item label="Confirm New Password">
                                    <Input.Password />
                                </Form.Item>
                            </div>
                            <Form.Item className="mt-auto">
                                <Button type="primary" htmlType="submit">Change Password</Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default Profile;
