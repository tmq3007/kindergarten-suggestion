import { Breadcrumb, Tabs, Skeleton, Typography } from 'antd';
import Link from 'next/link';
import ProfileSidebar from "@/app/public/view-account/ProfileSideBar";
import React from "react";
import ProfileSideBarSkeleton from "@/app/components/ProfileSideBarSkeleton";

const { Title } = Typography;
const { TabPane } = Tabs;
const transparentTabStyle = {
    border: 'none !important',
};

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen mt-14 bg-white">
            <div className="container mx-auto mt-10 px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                        <div className="bg-blue-50 rounded-lg shadow-md p-6 h-full">
                            <ProfileSideBarSkeleton />
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <div className="bg-blue-50 rounded-lg shadow-md p-4 h-full">
                            <Tabs
                                defaultActiveKey="1"
                                type="card"
                                size="small"
                                className="h-full bg-blue-50"
                                tabBarStyle={{
                                    marginBottom: 0,
                                    color: '#555',
                                }}
                            >
                                <TabPane
                                    tab="My Information"
                                    key="1"
                                    className="p-2 bg-blue-50"
                                    style={transparentTabStyle}
                                >
                                    <div className="space-y-6 mt-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <Skeleton.Input active className="!w-full" size="large" />
                                                <Skeleton.Input active className="!w-full" size="large" />
                                                <Skeleton.Input active className="!w-full" size="large" />
                                                <Skeleton.Input active className="!w-full" size="large" />
                                            </div>
                                            <div className="space-y-6">
                                                <Skeleton.Input active className="!w-full" size="large" />
                                                <Skeleton.Input active className="!w-full" size="large" />
                                                <Skeleton.Input active className="!w-full" size="large" />
                                                <Skeleton.Input active className="!w-full" size="large" />
                                            </div>
                                        </div>
                                        <div className="flex justify-center space-x-4">
                                            <Skeleton.Button active size="large" />
                                            <Skeleton.Button active size="large" />
                                        </div>
                                    </div>
                                </TabPane>
                                <TabPane tab="Change Password" key="2" className="p-4">
                                    <div className="max-w-md mx-auto space-y-6 mt-12">
                                        <Skeleton.Input active className="!w-1/2" size="large" />
                                        <Skeleton.Input active className="!w-1/2 mt-4" size="large" />
                                        <Skeleton.Button active className="mt-6" size="large" />
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
