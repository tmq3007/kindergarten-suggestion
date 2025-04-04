"use client";
import React, { useState, useEffect, useMemo } from "react";
import {Card, List, Typography, Avatar, Button, DatePicker, Select, Tooltip} from "antd";
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
import {
    ReviewAcceptDenyDTO,
    ReviewVO,
    useGetReviewBySchoolIdQuery,
    useReportDecisionMutation
} from "@/redux/services/reviewApi";
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    StarOutlined,
    BookOutlined,
    HomeOutlined,
    TrophyOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
} from "@ant-design/icons";
import {useParams, useSearchParams} from "next/navigation";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import RatingSkeleton from "@/app/components/skeleton/RatingSkeleton";
import NoData from "@/app/components/review/NoData";
import {REVIEW_STATUS} from "@/lib/constants";
import AdminReportModal from "@/app/components/review/AdminReportModal";
import {  ViewReportLink} from "@/app/components/review/ReviewButton";
const { RangePicker } = DatePicker;
const { Text } = Typography;


interface Report {
    id: number;
    report: string | undefined;
}

interface ReviewWithDayjs extends Omit<ReviewVO, "receiveDate"> {
    receiveDate: Dayjs;
}

interface EnhancedReview extends ReviewWithDayjs {
    reviewAverage: number;
}

const RatingsDashboard = () => {
    const params = useParams();
    const schoolId = Number(params.id as string);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    const [filteredReviews, setFilteredReviews] = useState<EnhancedReview[]>([]);
    const [showAll, setShowAll] = useState(false);

    const searchParams = useSearchParams();
    const fromSource = searchParams.get("from");
    const initialStatus = "";
    const [statusFilter, setStatusFilter] = useState<string | undefined>(
        fromSource === "notification" ? "PENDING" : initialStatus || undefined
    );
    const [visibleModal, setVisibleModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reportDecision, { isLoading: isDecisionLoading }] = useReportDecisionMutation();
    const [loadingReviewId, setLoadingReviewId] = useState<number | null>(null);

    const closeModal = () => {
        setVisibleModal(false);
        setSelectedReport(null);
    };

    const handleAccept = async () => {
        if (selectedReport && 'id' in selectedReport) {
            try {
                const dto: ReviewAcceptDenyDTO = {
                    id: selectedReport.id,
                    decision: true
                };
                await reportDecision(dto).unwrap();
                console.log("Report accepted successfully");
                setLoadingReviewId( selectedReport.id)
                setVisibleModal(false);
                setSelectedReport(null);
                // Optionally refetch the reviews after successful decision
                refetch();
            } catch (error) {
                console.error("Failed to accept report:", error);
            }
        }
    };

    const handleDeny = async () => {
        if (selectedReport && 'id' in selectedReport) {
            try {
                // @ts-ignore
                const dto: ReviewAcceptDenyDTO = {
                    id: selectedReport.id,
                    decision: false
                };
                setLoadingReviewId( selectedReport.id)
                await reportDecision(dto).unwrap();
                console.log("Report denied successfully");
                setVisibleModal(false);
                setSelectedReport(null);
                refetch();
            } catch (error) {
                console.error("Failed to deny report:", error);
            }
        }
    };

    const openModal = (report: { id: number; report: string | undefined } | null) => {
        setSelectedReport(report);
        setVisibleModal(true);
    };

    // Memoize query parameters for the API call
    const queryParams = useMemo(() => {
        const params: { schoolId: number; fromDate?: string; toDate?: string; status?: string } = { schoolId };
        if (dateRange && dateRange[0] && dateRange[1]) {
            params.fromDate = dateRange[0].format("YYYY-MM-DD");
            params.toDate = dateRange[1].format("YYYY-MM-DD");
        }
        if (statusFilter) {
            params.status = statusFilter;
        }
        return params;
    }, [schoolId, dateRange, statusFilter]);

    const { data, isLoading, error,isFetching, refetch } = useGetReviewBySchoolIdQuery(queryParams);

    useEffect(() => {
        if (!isFetching) {
            setLoadingReviewId(null);
        }
    }, [isFetching]);
    // Transform reviews data to use Dayjs for receiveDate and calculate reviewAverage
    const reviews: EnhancedReview[] = useMemo(
        () =>
            data?.data?.map((review) => ({
                ...review,
                receiveDate: dayjs(review.receiveDate).isValid() ? dayjs(review.receiveDate) : dayjs(),
                reviewAverage: (
                    (review.learningProgram || 0) +
                    (review.facilitiesAndUtilities || 0) +
                    (review.extracurricularActivities || 0) +
                    (review.teacherAndStaff || 0) +
                    (review.hygieneAndNutrition || 0)
                ) / 5,
            })) || [],
        [data]
    );

    console.log("test",reviews[0]?.status);

    // Sort reviews by reviewAverage in descending order
    const sortedReviews = useMemo(() => {
        return [...reviews].sort((a, b) => b.reviewAverage - a.reviewAverage);
    }, [reviews]);

    // Handle date range change
    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        setDateRange(dates);
    };

    // Handle status filter change
    const handleStatusChange = (value: string | undefined) => {
        setStatusFilter(value);
    };

    // Handle refresh button click
    const handleRefresh = () => {
        setDateRange(null);
        setStatusFilter(undefined);
        refetch();
    };

    // Calculate metrics
    const metrics = useMemo(() => {
        if (!reviews.length) {
            return {
                totalReviews: 0,
                totalAverage: 0,
                totalLearningProgram: 0,
                totalFacilitiesAndUtilities: 0,
                totalExtracurricularActivities: 0,
                totalTeacherAndStaff: 0,
                totalHygieneAndNutrition: 0,
                totalApproved: 0,
                totalPending: 0,
                totalRejected: 0,
                totalApprovedAverage: 0, // Add default value for approved average
            };
        }

        // Calculate totals for all reviews
        const totals = reviews.reduce(
            (acc, review) => {
                acc.learningProgram += review.learningProgram || 0;
                acc.facilitiesAndUtilities += review.facilitiesAndUtilities || 0;
                acc.extracurricularActivities += review.extracurricularActivities || 0;
                acc.teacherAndStaff += review.teacherAndStaff || 0;
                acc.hygieneAndNutrition += review.hygieneAndNutrition || 0;
                if (review.status === REVIEW_STATUS.APPROVED) acc.approved += 1;
                if (review.status === REVIEW_STATUS.PENDING) acc.pending += 1;
                if (review.status === REVIEW_STATUS.REJECTED) acc.rejected += 1;
                return acc;
            },
            {
                learningProgram: 0,
                facilitiesAndUtilities: 0,
                extracurricularActivities: 0,
                teacherAndStaff: 0,
                hygieneAndNutrition: 0,
                approved: 0,
                pending: 0,
                rejected: 0,
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

        // Calculate totals for approved reviews only
        const approvedReviews = reviews.filter(review => review.status === REVIEW_STATUS.APPROVED);
        const approvedTotals = approvedReviews.reduce(
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

        const totalApprovedReviews = approvedReviews.length;
        const totalApprovedAverage = totalApprovedReviews > 0
            ? Number(
                (
                    (approvedTotals.learningProgram +
                        approvedTotals.facilitiesAndUtilities +
                        approvedTotals.extracurricularActivities +
                        approvedTotals.teacherAndStaff +
                        approvedTotals.hygieneAndNutrition) /
                    (totalApprovedReviews * 5)
                ).toFixed(2)
            )
            : 0;

        return {
            totalReviews,
            totalAverage,
            totalLearningProgram: Number((totals.learningProgram / totalReviews).toFixed(2)),
            totalFacilitiesAndUtilities: Number((totals.facilitiesAndUtilities / totalReviews).toFixed(2)),
            totalExtracurricularActivities: Number((totals.extracurricularActivities / totalReviews).toFixed(2)),
            totalTeacherAndStaff: Number((totals.teacherAndStaff / totalReviews).toFixed(2)),
            totalHygieneAndNutrition: Number((totals.hygieneAndNutrition / totalReviews).toFixed(2)),
            totalApproved: totals.approved,
            totalPending: totals.pending,
            totalRejected: totals.rejected,
            totalApprovedAverage, // Add the new approved average
        };
    }, [reviews]);

    // Pie chart data
    const pieData = useMemo(
        () => [
            { name: "Learning Program", value: metrics.totalLearningProgram },
            { name: "Facilities & Utilities", value: metrics.totalFacilitiesAndUtilities },
            { name: "Extracurricular Activities", value: metrics.totalExtracurricularActivities },
            { name: "Teacher & Staff", value: metrics.totalTeacherAndStaff },
            { name: "Hygiene & Nutrition", value: metrics.totalHygieneAndNutrition },
        ],
        [metrics]
    );

    // Sử dụng useMemo để tính toán barData với 3 tháng gần nhất
    const barData = useMemo(() => {
        // Lấy ngày hiện tại
        const currentDate = dayjs();
        // Tính ngày bắt đầu của 3 tháng trước (bao gồm tháng hiện tại)
        const threeMonthsAgo = currentDate.subtract(2, 'month').startOf('month');

        // Gom nhóm dữ liệu theo tháng
        const monthlyData = reviews.reduce((acc, review) => {
            const reviewDate = review.receiveDate;
            // Chỉ tính các review trong 3 tháng gần nhất
            if (reviewDate.isAfter(threeMonthsAgo) || reviewDate.isSame(threeMonthsAgo, 'month')) {
                const month = reviewDate.format("MMMM YYYY");
                acc[month] = (acc[month] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(monthlyData)
            .map(([month, reviews]) => ({month, reviews}))
            .sort((a, b) => dayjs(a.month, "MMMM YYYY").diff(dayjs(b.month, "MMMM YYYY")));
    }, [reviews]);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

    // Update filtered reviews when reviews change
    useEffect(() => {
        setFilteredReviews(sortedReviews);
    }, [sortedReviews]);

    // Filter reviews by rating
    const filterFeedbackByRate = (selectedRates: string[]) => {
        setFilteredReviews(
            selectedRates.length === 0
                ? sortedReviews // If no rates selected, show all sorted reviews
                : sortedReviews.filter((review) => {
                    const reviewRating = Math.round(review.reviewAverage);
                    return selectedRates.includes(reviewRating.toString());
                })
        );
    };

    // Limit displayed reviews based on showAll state
    const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, 5);

    if (isLoading) {
        return <RatingSkeleton />;
    }

    return (
        <div className={'pt-2'}>
            <MyBreadcrumb
                paths={[
                    { label: "School Management", href: "/admin/management/school/school-list" },
                    { label: "School List", href: "/admin/management/school/school-list" },
                    { label: "School Detail", href: `/admin/management/school/school-detail/${schoolId}` },
                    { label: "Ratings & Feedback" },
                ]}
            />
            <SchoolManageTitle title={"Ratings & Feedback"} />

            <div className="min-h-screen p-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: isFetching ? 0.7 : 1,
                        y: 0,
                        transition: { duration: 0.3 }
                    }}
                    className="flex gap-4 mb-8 justify-center relative"
                >
                    {isFetching && (
                        <div className="absolute inset-0  bg-opacity-70 flex items-center justify-center z-10">
                            <SyncOutlined spin className="text-2xl text-blue-500" />
                        </div>
                    )}
                    <RangePicker
                        onChange={handleDateChange}
                        value={dateRange}
                        className="w-64"
                        disabled={isFetching}
                    />
                    <Select
                        className="w-40"
                        placeholder="Filter by status"
                        allowClear
                        onChange={handleStatusChange}
                        value={statusFilter}
                        options={[
                            { value: "APPROVED", label: "Active" },
                            { value: "PENDING", label: "Pending" },
                            { value: "REJECTED", label: "Inactive" },
                        ]}
                        disabled={isFetching}
                    />
                    <Button
                        type="primary"
                        icon={<SyncOutlined  />}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                </motion.div>

                {error ? (
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
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Card title="Monthly Reviews" className="w-full">
                                    {barData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={barData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Bar dataKey="reviews" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-500">
                                            No data in 3 months recently
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Card 1: Review Status (1/3 width) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="col-span-1"
                            >
                                <Card className="w-full p-0 min-h-[240px]">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <Text strong className="text-lg">
                                                Review Status
                                            </Text>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <FileTextOutlined className="text-gray-600 text-base" />
                                                        <Text className="text-gray-600 text-sm">Total Reviews</Text>
                                                    </div>
                                                    <Text strong className="text-base">{metrics.totalReviews}</Text>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircleOutlined className="text-green-600 text-base" />
                                                        <Text className="text-gray-600 text-sm">Approved</Text>
                                                    </div>
                                                    <Text strong className="text-base">{metrics.totalApproved}</Text>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <ClockCircleOutlined className="text-yellow-600 text-base" />
                                                        <Text className="text-gray-600 text-sm">Pending</Text>
                                                    </div>
                                                    <Text strong className="text-base">{metrics.totalPending}</Text>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <CloseCircleOutlined className="text-red-600 text-base" />
                                                        <Text className="text-gray-600 text-sm">Rejected</Text>
                                                    </div>
                                                    <Text strong className="text-base">{metrics.totalRejected}</Text>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Card 2: Average Rating (1/3 width) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="col-span-1"
                            >
                                <Card className="w-full min-h-[240px]">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <Text strong className="text-lg">
                                                Average Rating
                                            </Text>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <StarOutlined className="text-orange-600 text-base" />
                                                        <Text className="text-gray-600 text-sm">Overall</Text>
                                                    </div>
                                                    <Text strong className="text-base">{metrics.totalAverage.toFixed(1)}</Text>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <StarFilled className="text-green-600 text-base" />
                                                        <Text className="text-gray-600 text-sm">Approved Only</Text>
                                                    </div>
                                                    <Text strong className="text-base">{metrics.totalApprovedAverage.toFixed(1)}</Text>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Card 3: Category Ratings (1/3 width) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="col-span-1"
                            >
                                <Card className="w-full min-h-[240px]">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <Text strong className="text-lg">
                                                Category Ratings
                                            </Text>
                                            <div className="mt-2 space-y-2">
                                                {[
                                                    { title: "Learning Program", value: metrics.totalLearningProgram, icon: <BookOutlined />, color: "text-blue-600" },
                                                    { title: "Facilities", value: metrics.totalFacilitiesAndUtilities, icon: <HomeOutlined />, color: "text-purple-600" },
                                                    { title: "Extracurricular", value: metrics.totalExtracurricularActivities, icon: <TrophyOutlined />, color: "text-orange-600" },
                                                    { title: "Teachers & Staff", value: metrics.totalTeacherAndStaff, icon: <TeamOutlined />, color: "text-teal-600" },
                                                    { title: "Hygiene", value: metrics.totalHygieneAndNutrition, icon: <MedicineBoxOutlined />, color: "text-green-600" },
                                                ].map((stat) => (
                                                    <div key={stat.title} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            {stat.icon && <span className={`${stat.color} text-base`}>{stat.icon}</span>}
                                                            <Text className="text-gray-600 text-sm">{stat.title}</Text>
                                                        </div>
                                                        <Text strong className="text-base">{stat.value}</Text>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
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
                                    className="w-full sm:w-48"
                                />
                            }
                        >
                            <List
                                dataSource={displayedReviews.slice(0, showAll ? displayedReviews.length : 5)}
                                renderItem={(item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{
                                            scale: 1.01,
                                            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
                                            transition: { duration: 0.3, ease: "easeInOut" },
                                        }}
                                        className="p-2 md:p-3"
                                    >
                                        <List.Item className="!px-2 sm:!px-3">
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar src={item.parentImage} className="bg-blue-500">
                                                        {item.parentImage || "A"}
                                                    </Avatar>
                                                }
                                                title={
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                                        <Text strong className="text-sm sm:text-base">
                                                            {item.feedback || "No feedback provided"}
                                                        </Text>
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                            {item.report && item.status === REVIEW_STATUS.PENDING && (
                                                                <ViewReportLink
                                                                    onClick={() => openModal({ id: item.id, report: item.report })}
                                                                    disabled={false}
                                                                    onFetching={false}
                                                                />
                                                            )}

                                                            {(item.status === REVIEW_STATUS.REJECTED) && (
                                                                <Tooltip placement="topRight" title={item.report} color="gray" key="rejected-tooltip">
                                                                    <span className="text-xs text-gray-500 cursor-default">
                                                                        This review will be hidden
                                                                    </span>
                                                                </Tooltip>
                                                            )}

                                                        </div>
                                                    </div>
                                                }
                                                description={
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Text type="secondary">{item.parentName || "Anonymous"}</Text>
                                                            <div className="flex">
                                                                {[...Array(Math.floor(item.reviewAverage || 0))].map(
                                                                    (_, i) => (
                                                                        <StarFilled
                                                                            key={i}
                                                                            className="text-yellow-400 text-sm"
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                            <Text type="secondary" className="text-xs sm:text-sm">
                                                                {item.receiveDate.isValid()
                                                                    ? item.receiveDate.format("D MMMM YYYY")
                                                                    : "Date unavailable"}
                                                            </Text>
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
                                    <Button
                                        type="link"
                                        onClick={() => setShowAll(!showAll)}
                                        className={`${
                                            filteredReviews.length <= 5 ? "blur-sm opacity-50 cursor-not-allowed" : "cursor-pointer"
                                        }`}
                                        disabled={filteredReviews.length <= 5}
                                    >
                                        {showAll ? "Show Less" : `View More (${filteredReviews.length - 5})`}
                                    </Button>
                                </div>
                            )}
                            <AdminReportModal
                                open={visibleModal}
                                onClose={closeModal}
                                onAccept={handleAccept}
                                onDeny={handleDeny}
                                reportContent={selectedReport?.report}
                            />
                        </Card>

                    </>
                )}
            </div>
        </div>

    );
};

export default RatingsDashboard;