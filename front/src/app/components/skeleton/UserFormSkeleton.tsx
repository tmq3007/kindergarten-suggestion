import {Breadcrumb, Tabs, Skeleton, Typography, Form, Input, Select, DatePicker, Button} from 'antd';
import Link from 'next/link';
import ProfileSidebar from "@/app/components/user/ProfileSideBar";
import React from "react";
import ProfileSideBarSkeleton from "@/app/components/skeleton/ProfileSideBarSkeleton";
import {div} from "framer-motion/client";
import dayjs from "dayjs";

const { Title } = Typography;
const { TabPane } = Tabs;
const transparentTabStyle = {
    border: 'none !important',
};

const UserFormSkeleton = () => {
    return (
        <div className="min-h-screen mt-10 bg-white bg-opacity-0">
            <div className="container mx-auto mt-10 px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 h-full">
                            <ProfileSideBarSkeleton />
                        </div>
                    </div>
                    <div className=" h-full my-auto col-span-1 md:col-span-2  bg-white rounded-lg shadow-md p-4">
                        <Tabs
                            defaultActiveKey="1"
                            type="card"
                            size="small"
                            className="h-full "
                            tabBarStyle={{
                                marginBottom: 0,
                                color: '#555',
                            }}
                        >
                            <TabPane
                                tab="My Information"
                                key="1"
                                className="p-2  "
                                style={transparentTabStyle}
                            >
                                <Form
                                    layout="vertical"
                                    className="space-y-6 mt-12"
                                >
                                    {/* Form fields remain unchanged */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <Form.Item
                                                name="fullname"
                                                label={<span className="text-black">Full Name</span>}
                                                required={true}
                                            >
                                                <Skeleton.Input active={true} className={'!w-full'}/>
                                            </Form.Item>
                                            <Form.Item
                                                name="email"
                                                label={<span className="text-black">Email Address</span>}
                                                required={true}
                                            >
                                                <Skeleton.Input active={true} className={'!w-full'}/>
                                            </Form.Item>
                                            <Form.Item
                                                name="dob"
                                                label={<span className="text-black"> Date of Birth</span>}
                                                required={true}
                                            >
                                               <Skeleton.Input active={true} className={'!w-full'}/>
                                            </Form.Item>
                                            <Form.Item
                                                name="phone"
                                                label={<span className="text-black"> Phone Number</span>}
                                                required={true}
                                            >
                                                <Skeleton.Input active={true} className={'!w-full'}/>
                                            </Form.Item>
                                        </div>
                                        <div className="space-y-6">
                                            <Form.Item
                                                name="dob"
                                                label={<span className="text-black">Address</span>}
                                                required={true}
                                            >
                                                <Skeleton.Input active={true} className={'!w-full mb-2'}/>
                                                <Skeleton.Input active={true} className={'!w-full mb-2'}/>
                                                <Skeleton.Input active={true} className={'!w-full mb-2'}/>
                                                <Skeleton.Input active={true} className={'!w-full mb-2'}/>
                                            </Form.Item>

                                        </div>
                                    </div>
                                    <div className="flex justify-center space-x-4">
                                        <Skeleton.Button/>
                                        <Skeleton.Button/>
                                    </div>
                                </Form>
                            </TabPane>
                            <TabPane
                                tab="Change Password"
                                key="2"
                                className="p-4"
                                style={transparentTabStyle}
                            >
                                <Form
                                    layout="vertical"
                                    className="max-w-md mx-auto space-y-6 mt-12"
                                >
                                    <Form.Item
                                        name="oldPassword"
                                        label={<span className="text-black">Current Password</span>}
                                    >
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item
                                        name="newPassword"
                                        label={<span className="text-black">New Password</span>}
                                    >
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item
                                        name="confirmPassword"
                                        label={<span className="text-black">Confirm New Password</span>}
                                    >
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <div className="flex justify-center">
                                        <Skeleton.Button/>
                                    </div>
                                </Form>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserFormSkeleton;