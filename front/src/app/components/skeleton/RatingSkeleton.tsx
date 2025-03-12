"use client";
import React from "react";
import { Card, Skeleton, Avatar, Select, List, Typography } from "antd";
import { StarFilled } from "@ant-design/icons";
import { motion } from "framer-motion";

import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";

const { Text } = Typography;

const mockFeedback = [
    { id: 1, name: "John Doe", rating: 4 },
    { id: 2, name: "Jane Smith", rating: 5 },
    { id: 3, name: "Alice Brown", rating: 3 },
    { id: 4, name: "Bob Johnson", rating: 2 },
    { id: 5, name: "Charlie White", rating: 5 },
];

const RatingSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 mb-8 justify-center">
                <Skeleton.Input className="w-64" active />
                <Skeleton.Button active />
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }}>
                    <Card title="Rating Distribution">
                        <Skeleton active paragraph={{ rows: 6 }} />
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }}>
                    <Card title="Monthly Reviews">
                        <Skeleton active paragraph={{ rows: 6 }} />
                    </Card>
                </motion.div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {mockFeedback.map((item) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.1 }}>
                        <Card>
                            <div className="flex items-center gap-4">
                                <Skeleton.Avatar active size={40} />
                                <div>
                                    <Skeleton.Input active className="w-16" />
                                    <Skeleton.Input active className="w-24 mt-2" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Recent Feedback List */}
            <Card
                title="Recent Feedback"
                extra={
                    <Select mode="multiple" placeholder="Filter by rating" className="w-48" disabled>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Select.Option key={star} value={star}>
                                {star} Star
                            </Select.Option>
                        ))}
                    </Select>
                }
            >
                <List
                    dataSource={mockFeedback}
                    renderItem={(item) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}>
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Skeleton.Avatar active />}
                                    title={<Skeleton.Input active className="w-48" />}
                                    description={
                                        <div className="flex items-center gap-2">
                                            <Skeleton.Input active className="w-24" />
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarFilled key={i} className={i < item.rating ? "text-yellow-500 text-sm" : "text-gray-300 text-sm"} />
                                                ))}
                                            </div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        </motion.div>
                    )}
                />

                {/* View More Button */}
                <div className="text-center mt-4">
                    <Skeleton.Button active />
                </div>
            </Card>
        </div>
    );
};

export default RatingSkeleton;
