// FormSkeleton.tsx
import React from 'react';
import {Breadcrumb, Button, DatePicker, Form, Image, Input, Select, Skeleton, Tabs} from 'antd';
import Link from "next/link";
import Title from "antd/lib/typography/Title";
import dayjs from "dayjs";

const {TabPane} = Tabs;

const FormSkeleton: React.FC = () => {
    return (
        <div className="relative min-h-screen flex flex-col p-7">
            <Breadcrumb
                className="mt-[50px] mb-0"
                items={[
                    {title: <Link href="/">Home</Link>},
                    {title: "My Profile"},
                ]}
            />
            <Title level={3} className="my-2">My Profile</Title>
            <div className="flex-grow flex items-center justify-center">
                <Tabs
                    defaultActiveKey="1"
                    type="card"
                    size="small"
                    centered
                    className="w-[1000px] h-[600px] flex flex-col"
                    tabBarStyle={{
                        marginBottom: 0,

                    }}
                >
                    <TabPane tab="My Information" key="1" className="h-full w-full">
                        <Form
                            layout="vertical"
                            className="h-full flex flex-col p-4 overflow-auto" // Add padding and scroll if needed
                        >
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                <div className="flex flex-col">
                                    <Form.Item
                                        name="fullname"
                                        label="Full Name"
                                        className="mb-10"
                                    >
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item
                                        name="email"
                                        label="Email Address"
                                        className="mb-10"
                                    >
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item name="province" label="Province" className="mb-10">
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item name="district" label="District" className="mb-10">
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                </div>
                                <div className="flex flex-col">
                                    <Form.Item
                                        name="dob"
                                        label="Date of Birth"
                                        className="mb-10"
                                    >
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item
                                        name="phone"
                                        label="Phone Number"
                                        className="mb-10"
                                    >
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item name="ward" label="Ward" className="mb-10">
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item name="street" label="Street" className="mb-10 h-[33px]"
                                               dependencies={['ward']}>
                                        <Skeleton.Input active={true} className={'!w-full'}/>
                                    </Form.Item>
                                </div>
                            </div>
                            <Form.Item className="mb-7 mt-3 flex justify-center">
                                <Skeleton.Button/>
                                <Skeleton.Button/>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="Change Password" key="2" className="h-full"/>
                </Tabs>
            </div>
        </div>
    );
};

export default FormSkeleton;