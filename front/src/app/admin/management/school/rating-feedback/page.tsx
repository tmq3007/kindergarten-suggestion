'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Card, List, Typography, Avatar, Breadcrumb, Button, Spin, DatePicker, Select } from "antd";
import { StarFilled, SyncOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
} from "recharts";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ReviewVO, useGetReviewBySchoolIdQuery } from "@/redux/services/reviewApi";

// Extend Dayjs with the isBetween plugin
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface RatingsDashboardPageProps {
    schoolId: number;
}

const RatingsDashboardPage: React.FC<RatingsDashboardPageProps> = ({ schoolId = 1 }) => {
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | [string, string] | null>(null);
    const [filteredReviews, setFilteredReviews] = useState<ReviewVO[]>([]);

    const { data, isLoading, error, refetch } = useGetReviewBySchoolIdQuery(schoolId);

    // Memoized reviews with proper Dayjs parsing
    const reviews: ReviewVO[] = useMemo(() =>
            data?.data?.map(review => ({
                ...review,
                receiveDate: review.receiveDate ? dayjs(review.receiveDate) : dayjs(),
            })) || [],
        [data]);

    // Memoized calculations
    const metrics = useMemo(() => {
        if (!reviews || reviews.length === 0) {
            return {
                totalReviews: 0,
                totalAverage: 0,
                totalLearningProgram: 0,
                totalFacilitiesAndUtilities: 0,
                totalExtracurricularActivities: 0,
                totalTeacherAndStaff: 0,
                totalHygieneAndNutrition: 0,
            };
        }

        let totalLearningProgram = 0;
        let totalFacilitiesAndUtilities = 0;
        let totalExtracurricularActivities = 0;
        let totalTeacherAndStaff = 0;
        let totalHygieneAndNutrition = 0;

        reviews.forEach(review => {
            totalLearningProgram += review.learningProgram || 0;
            totalFacilitiesAndUtilities += review.facilitiesAndUtilities || 0;
            totalExtracurricularActivities += review.extracurricularActivities || 0;
            totalTeacherAndStaff += review.teacherAndStaff || 0;
            totalHygieneAndNutrition += review.hygieneAndNutrition || 0;
        });

        const totalReviews = reviews.length;
        const totalAverage = Number((
            (totalLearningProgram + totalFacilitiesAndUtilities + totalExtracurricularActivities + totalTeacherAndStaff + totalHygieneAndNutrition) / (totalReviews * 5)
        ).toFixed(2));

        return {
            totalReviews,
            totalAverage,
            totalLearningProgram: Number((totalLearningProgram / totalReviews).toFixed(2)),
            totalFacilitiesAndUtilities: Number((totalFacilitiesAndUtilities / totalReviews).toFixed(2)),
            totalExtracurricularActivities: Number((totalExtracurricularActivities / totalReviews).toFixed(2)),
            totalTeacherAndStaff: Number((totalTeacherAndStaff / totalReviews).toFixed(2)),
            totalHygieneAndNutrition: Number((totalHygieneAndNutrition / totalReviews).toFixed(2)),
        };
    }, [reviews]);


    // Chart data
    const pieData = useMemo(() => [
        { name: "Learning Program", value: metrics.totalLearningProgram },
        { name: "Facilities & Utilities", value: metrics.totalFacilitiesAndUtilities },
        { name: "Extracurricular Activities", value: metrics.totalExtracurricularActivities },
        { name: "Teacher & Staff", value: metrics.totalTeacherAndStaff },
        { name: "Hygiene & Nutrition", value: metrics.totalHygieneAndNutrition },
    ], [metrics]);

    const barData = useMemo(() => {
        const monthlyData = reviews.reduce((acc, review) => {
            const month = review.receiveDate ? dayjs(review.receiveDate).format("MMMM YYYY") : "";
            if (month) {
                acc[month] = (acc[month] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(monthlyData).map(([month, reviews]) => ({ month, reviews }));
    }, [reviews]);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

    useEffect(() => {
        setFilteredReviews(reviews);
    }, [reviews]);

    const handleDateChange = (dates: [Dayjs, Dayjs] | [string, string] | null) => {
        setDateRange(dates);
        if (!dates) {
            setFilteredReviews(reviews);
            return;
        }
        const [start, end] = dates;
        // Convert dates to Dayjs objects, whether they are strings or Dayjs
        const startDate = Array.isArray(start) ? dayjs(start[0]) : (start instanceof Dayjs ? start : dayjs(start));
        const endDate = Array.isArray(end) ? dayjs(end[1]) : (end instanceof Dayjs ? end : dayjs(end));
        setFilteredReviews(reviews.filter((review: ReviewVO) => {
            // Ensure receiveDate is a Dayjs object, even if it's a string
            const reviewDate = review.receiveDate instanceof Dayjs
                ? review.receiveDate
                : dayjs(review.receiveDate);
            // Check if reviewDate is within the range [startDate, endDate] using isSameOrAfter and isSameOrBefore
            return reviewDate.isBetween(startDate, endDate, "day", "[]");
        }));
    };

    const filterFeedbackByRate = (selectedRates: string[]) => {
        setFilteredReviews(
            selectedRates.length === 0
                ? reviews
                : reviews.filter(review =>
                    review.average && selectedRates.includes(Math.floor(review.average).toString())
                )
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" tip="Loading reviews..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Text type="danger">
                    Error loading reviews: {JSON.stringify(error)}
                </Text>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Breadcrumb
                className="mb-6"
                items={[
                    { title: <Link href="/admin/management/school/">School Management</Link> },
                    { title: <Link href="/admin/management/school/school-list">School List</Link> },
                    { title: <Link href="/admin/management/school/school-detail">School Detail</Link> },
                ]}
            />

            <Title level={3} className="mb-6">Ratings & Feedback</Title>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 mb-8 justify-center"
            >
                <RangePicker
                  // onChange={handleDateChange}
                    className="w-64"
                />
                <Button
                    type="primary"
                    icon={<SyncOutlined />}
                    onClick={refetch}
                >
                    Refresh
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card title="Rating Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Monthly Reviews">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="reviews" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: "Average Rating", value: metrics.totalAverage.toFixed(1), color: "purple" },
                    { title: "Total Reviews", value: metrics.totalReviews, color: "blue" },
                    { title: "Learning Program", value: metrics.totalLearningProgram, color: "green" },
                    { title: "Facilities", value: metrics.totalFacilitiesAndUtilities, color: "orange" },
                    { title: "Extracurricular", value: metrics.totalExtracurricularActivities, color: "yellow" },
                    { title: "Teachers & Staff", value: metrics.totalTeacherAndStaff, color: "red" },
                    { title: "Hygiene", value: metrics.totalHygieneAndNutrition, color: "pink" },
                ].map(stat => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.1 }}
                    >
                        <Card>
                            <div className="flex items-center gap-4">
                                <Avatar
                                    size={40}
                                    icon={<StarFilled />}
                                    className={`bg-${stat.color}-200 text-${stat.color}-800`}
                                />
                                <div>
                                    <Text strong className="text-lg">{stat.value}</Text>
                                    <Text className="block text-gray-600">{stat.title}</Text>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card
                title="Recent Feedback"
                extra={
                    <Select
                        mode="multiple"
                        placeholder="Filter by rating"
                        onChange={filterFeedbackByRate}
                        options={[1, 2, 3, 4, 5].map(n => ({ value: n.toString(), label: `${n} Star${n !== 1 ? 's' : ''}` }))}
                        className="w-48"
                    />
                }
            >
                <List
                    dataSource={filteredReviews.slice(0, 5)}
                    renderItem={(item) => (
                        <List.Item>

                            <List.Item.Meta
                                avatar={<Avatar className="bg-blue-500">{item.parentName?.[0] || "A"}</Avatar>}
                                title={
                                    <div className="flex justify-between items-center">
                                        <Text strong>{item.feedback || "No feedback provided"}</Text>
                                        <Text type="secondary" className="text-sm">
                                            {(item.receiveDate ? dayjs(item.receiveDate) : dayjs()).format("D MMMM YYYY")}
                                        </Text>
                                    </div>
                                }
                                description={

                                    <div className="flex items-center gap-2">
                                        <Text type="secondary">{item.parentName || "Anonymous"}</Text>
                                        <div className="flex">
                                            {[...Array(Math.floor(item.average || 0))].map((_, i) => (
                                                <StarFilled key={i} className="text-yellow-400 text-sm" />
                                            ))}
                                        </div>
                                    </div>
                                 }
                            />

                        </List.Item>
                    )}
                />
                {filteredReviews.length > 5 && (
                    <div className="text-center mt-4">
                        <Button type="link">View More ({filteredReviews.length - 5})</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default RatingsDashboardPage;