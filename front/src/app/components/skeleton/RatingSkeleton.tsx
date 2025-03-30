"use client";
import React from "react";
import { Card, Skeleton, Select, Typography } from "antd";

import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";


const RatingSkeleton = () => {
    return (
        <div className="min-h-screen p-2">
            {/* Breadcrumb */}
            <MyBreadcrumb
                paths={[
                    { label: "School Management", href: "/admin/management/school/school-list" },
                    { label: "School List", href: "/admin/management/school/school-list" },
                    { label: "School Detail", href: `/admin/management/school/school-detail/schoolId` },
                    { label: "Ratings & Feedback" },
                ]}
            />
            {/* Title */}
            <SchoolManageTitle title="Ratings & Feedback" />

            {/* Date Range Picker and Refresh Button */}
            <div className="flex gap-4 mb-8 justify-center">
                <Skeleton.Input className="w-64" active />
                <Skeleton.Button active />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div >
                    <Card title="Rating Distribution">
                        <Skeleton active paragraph={{ rows: 6 }} />
                    </Card>
                </div>
                <div>
                    <Card title="Monthly Reviews">
                        <Skeleton active paragraph={{ rows: 6 }} />
                    </Card>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Card 1: Review Status (1/3 width) */}
                <div
                    className="col-span-1"
                >
                    <Card className="w-full p-0 min-h-[240px]">
                        <Skeleton.Input className={'!w-full !h-[200px]'} active={true}/>
                    </Card>
                </div>

                {/* Card 2: Average Rating (1/3 width) */}
                <div
                    className="col-span-1"
                >
                    <Card className="w-full min-h-[240px]">
                        <Skeleton.Input className={'!w-full !h-[200px]'} active={true}/>
                    </Card>
                </div>

                {/* Card 3: Category Ratings (1/3 width) */}
                <div
                    className="col-span-1"
                >
                    <Card className="w-full min-h-[240px]">
                        <Skeleton.Input className={'!w-full !h-[200px]'} active={true}/>
                    </Card>
                </div>
            </div>

            {/* Recent Feedback List */}
            <Card
                title="Recent Feedback"
                extra={
                    <Select mode="multiple" placeholder="Filter by rating" className="w-48" disabled>
                        {[1, 2, 3, 4, 5,6,7].map((star) => (
                            <Select.Option key={star} value={star}>
                                {star} Star
                            </Select.Option>
                        ))}
                    </Select>
                }
            >

                <Skeleton.Input active className="!w-full !h-[500px]" />

            </Card>
        </div>
    );
};

export default RatingSkeleton;
