"use client";
import React, { useState, useEffect } from "react";
import { Card, List, Typography, Avatar, Button, DatePicker, Select } from "antd";
import { StarFilled, SyncOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
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
import { ReviewVO, useGetReviewBySchoolOwnerQuery } from "@/redux/services/reviewApi";
import NoData from "../../../components/common/NoData";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import RatingSkeleton from "@/app/components/skeleton/RatingSkeleton";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface ReviewWithDayjs extends Omit<ReviewVO, "receiveDate"> {
    receiveDate: Dayjs;
}

interface EnhancedReview extends ReviewWithDayjs {
    reviewAverage: number;
}

interface QueryParams {
    fromDate?: string;
    toDate?: string;
}

const RatingsDashboard = () => {
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [filteredReviews, setFilteredReviews] = useState<EnhancedReview[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [queryParams, setQueryParams] = useState<QueryParams>({});

    const { data, isLoading, isFetching, error, refetch } = useGetReviewBySchoolOwnerQuery(queryParams);
    const [reviews, setReviews] = useState<EnhancedReview[]>([]);
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        refetch();
    }, [user, refetch]);

    useEffect(() => {
        const params: QueryParams = {};
        if (dateRange?.[0] && dateRange?.[1]) {
            params.fromDate = dateRange[0].format("YYYY-MM-DD");
            params.toDate = dateRange[1].format("YYYY-MM-DD");
        }
        setQueryParams(params);
    }, [dateRange]);

    useEffect(() => {
        if (data?.data) {
            const transformedReviews = data.data.map((review) => ({
                ...review,
                receiveDate: dayjs(review.receiveDate).isValid() ? dayjs(review.receiveDate) : dayjs(),
                reviewAverage: (
                    (review.learningProgram || 0) +
                    (review.facilitiesAndUtilities || 0) +
                    (review.extracurricularActivities || 0) +
                    (review.teacherAndStaff || 0) +
                    (review.hygieneAndNutrition || 0)
                ) / 5,
            }));
            const sortedReviews = [...transformedReviews].sort((a, b) => b.reviewAverage - a.reviewAverage);
            setReviews(transformedReviews);
            setFilteredReviews(sortedReviews);
        } else {
            setReviews([]);
            setFilteredReviews([]);
        }
    }, [data]);

    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        setDateRange(dates);
    };

    const handleRefresh = () => {
        setDateRange(null);
        refetch();
    };

    const metrics = (() => {
        if (!reviews.length) {
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

        const totals = reviews.reduce(
            (acc, review) => {
                acc.learningProgram += review.learningProgram || 0;
                acc.facilitiesAndUtilities += review.facilitiesAndUtilities || 0;
                acc.extracurricularActivities += review.extracurricularActivities || 0;
                acc.teacherAndStaff += review.teacherAndStaff || 0;
                acc.hygieneAndNutrition += review.hygieneAndNutrition || 0;
                return acc;
            },
            {
                learningProgram: 0,
                facilitiesAndUtilities: 0,
                extracurricularActivities: 0,
                teacherAndStaff: 0,
                hygieneAndNutrition: 0,
            }
        );

        const totalReviews = reviews.length;
        const totalAverage = Number(
            (
                (totals.learningProgram +
                    totals.facilitiesAndUtilities +
                    totals.extracurricularActivities +
                    totals.teacherAndStaff +
                    totals.hygieneAndNutrition) /
                (totalReviews * 5)
            ).toFixed(2)
        );

        return {
            totalReviews,
            totalAverage,
            totalLearningProgram: Number((totals.learningProgram / totalReviews).toFixed(2)),
            totalFacilitiesAndUtilities: Number((totals.facilitiesAndUtilities / totalReviews).toFixed(2)),
            totalExtracurricularActivities: Number((totals.extracurricularActivities / totalReviews).toFixed(2)),
            totalTeacherAndStaff: Number((totals.teacherAndStaff / totalReviews).toFixed(2)),
            totalHygieneAndNutrition: Number((totals.hygieneAndNutrition / totalReviews).toFixed(2)),
        };
    })();

    const pieData = [
        { name: "Learning Program", value: metrics.totalLearningProgram },
        { name: "Facilities & Utilities", value: metrics.totalFacilitiesAndUtilities },
        { name: "Extracurricular Activities", value: metrics.totalExtracurricularActivities },
        { name: "Teacher & Staff", value: metrics.totalTeacherAndStaff },
        { name: "Hygiene & Nutrition", value: metrics.totalHygieneAndNutrition },
    ];

    const barData = (() => {
        const monthlyData = reviews.reduce((acc, review) => {
            const month = review.receiveDate.format("MMMM YYYY");
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(monthlyData).map(([month, reviews]) => ({ month, reviews }));
    })();

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

    const filterFeedbackByRate = (selectedRates: string[]) => {
        const sortedReviews = [...reviews].sort((a, b) => b.reviewAverage - a.reviewAverage);
        setFilteredReviews(
            selectedRates.length === 0
                ? sortedReviews
                : sortedReviews.filter((review) => {
                    const reviewRating = Math.round(review.reviewAverage);
                    return selectedRates.includes(reviewRating.toString());
                })
        );
    };

    const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, 5);

    // Kiểm tra các trạng thái: loading, fetching, hoặc error
    if (isLoading || isFetching) {
        return <RatingSkeleton />;
    }

    if (error) {
        return <NoData />;
    }

    return (
        <div className={'pt-2'}>
            <MyBreadcrumb
                paths={[
                    { label: "My School", href: "/public/school-owner" },
                    { label: "Ratings & Feedback" },
                ]}
            />
            <SchoolManageTitle title={"Ratings & Feedback"} />

            <div className="min-h-screen bg-gray-50 p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 mb-8 justify-center"
                >
                    <RangePicker onChange={handleDateChange} value={dateRange} className="w-64" />
                    <Button type="primary" icon={<SyncOutlined />} onClick={handleRefresh}>
                        Refresh
                    </Button>
                </motion.div>

                {reviews.length === 0 ? (
                    <NoData />
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }}>
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
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }}>
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
                            </motion.div>
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
                            ].map((stat) => (
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
                                                <Text strong className="text-lg">
                                                    {stat.value}
                                                </Text>
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
                                    options={[1, 2, 3, 4, 5].map((n) => ({
                                        value: n.toString(),
                                        label: `${n} Star${n !== 1 ? "s" : ""}`,
                                    }))}
                                    className="w-48"
                                />
                            }
                        >
                            <List
                                dataSource={displayedReviews}
                                renderItem={(item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{
                                            scale: 1.01,
                                            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
                                            transition: { duration: 0.3, ease: "easeInOut" },
                                        }}
                                    >
                                        <List.Item className="!px-3">
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar src={item.parentImage} className="bg-blue-500">
                                                        {item.parentImage || "A"}
                                                    </Avatar>
                                                }
                                                title={
                                                    <div className="flex justify-between items-center">
                                                        <Text strong>{item.feedback || "No feedback provided"}</Text>
                                                        <Text type="secondary" className="text-sm">
                                                            {item.receiveDate.isValid()
                                                                ? item.receiveDate.format("D MMMM YYYY")
                                                                : "Date unavailable"}
                                                        </Text>
                                                    </div>
                                                }
                                                description={
                                                    <div className="flex items-center gap-2">
                                                        <Text type="secondary">{item.parentName || "Anonymous"}</Text>
                                                        <div className="flex">
                                                            {[...Array(Math.floor(item.reviewAverage || 0))].map((_, i) => (
                                                                <StarFilled key={i} className="text-yellow-400 text-sm" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    </motion.div>
                                )}
                            />
                            {filteredReviews.length > 5 && (
                                <div className="text-center mt-4">
                                    <Button type="link" onClick={() => setShowAll(!showAll)}>
                                        {showAll ? "Show Less" : `View More (${filteredReviews.length - 5})`}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default RatingsDashboard;