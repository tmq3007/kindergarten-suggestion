"use client";
import React, {useEffect, useMemo, useState} from "react";
import {Avatar, Button, Card, DatePicker, List, message, Select, Tooltip, Typography} from "antd";
import {
    BookOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    StarFilled,
    StarOutlined,
    SyncOutlined,
    TeamOutlined,
    TrophyOutlined
} from "@ant-design/icons";
import "antd/dist/reset.css";
import {motion} from "framer-motion";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import dayjs, {Dayjs} from "dayjs";
import {ReviewVO, useGetReviewBySchoolOwnerQuery, useReportReviewMutation} from "@/redux/services/reviewApi";
import NoData from "../../../components/review/NoData";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import RatingSkeleton from "@/app/components/skeleton/RatingSkeleton";
import {REVIEW_STATUS} from "@/lib/constants";
import {MakeReportLink} from "@/app/components/review/ReviewButton";
import SchoolOwnerReportModal from "@/app/components/review/SchoolOwnerReportModal";
import {usePathname} from "next/navigation"; // Replace useRouter with usePathname

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
    status?:string
}

interface Report {
    id: number;
    reason: string | undefined;
}
const RatingsDashboard = () => {
    const pathname = usePathname(); // Get the current pathname
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [filteredReviews, setFilteredReviews] = useState<EnhancedReview[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [queryParams, setQueryParams] = useState<QueryParams>({});
    const [reviews, setReviews] = useState<EnhancedReview[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const initialStatus = "";
    const [statusFilter, setStatusFilter] = useState<string | undefined>(
        initialStatus || undefined
    );

    const { data, isLoading, isFetching, error, refetch } = useGetReviewBySchoolOwnerQuery(queryParams);

    useEffect(() => {
        refetch();
    }, [queryParams, refetch]);

    useEffect(() => {
        if (pathname === "/public/school-owner/rating-feedback") {
            setIsNavigating(true);
            refetch().finally(() => setIsNavigating(false)); // Reset after refetch completes
        }
    }, [pathname, refetch]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const [reportReview, { isLoading: isReporting }] = useReportReviewMutation();

    const [loadingReviewId, setLoadingReviewId] = useState<number | null>(null);

    const handleSubmitReport = async (reportContent: string, reviewId: number | null) => {
        if (!reviewId || !reportContent) return;

        try {
            setLoadingReviewId(reviewId); // Set the specific review ID that's loading
            const reportDTO = {
                id: reviewId,
                reason: reportContent
            };
            await reportReview(reportDTO).unwrap();
            message.success('Report submitted successfully');
            setIsModalOpen(false);
            setSelectedReport(null);
            refetch();
        } catch (error) {
            message.error('Failed to submit report');
            console.error('Report submission failed:', error);
        }
    };

    useEffect(() => {
        if (!isFetching) {
            setLoadingReviewId(null);
        }
    }, [isFetching]);

    const openModal = (report: { id: number; reason: string | undefined } | null) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const handleCancelModal = () => setIsModalOpen(false);

    useEffect(() => {
        const params: QueryParams = {};
        if (dateRange?.[0] && dateRange?.[1]) {
            // Convert to full ISO datetime
            params.fromDate = dateRange[0].startOf('day').toISOString();
            params.toDate = dateRange[1].endOf('day').toISOString();
        }
        if (statusFilter) {
            params.status = statusFilter;
        }
        setQueryParams(params);
    }, [dateRange, statusFilter]);

    useEffect(() => {
        refetch();
    }, [queryParams, refetch]);

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

    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => setDateRange(dates);

    // Handle refresh button click
    const handleRefresh = () => {
        setDateRange(null);
        setStatusFilter(undefined);
        refetch();
    };

    const handleStatusChange = (value: string | undefined) => {
        setStatusFilter(value);
    };

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

    // Sử dụng useMemo để tính toán pieData
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

    const displayedReviews = useMemo(
        () => (showAll ? filteredReviews : filteredReviews.slice(0, 5)),
        [filteredReviews, showAll]
    );

    if (isLoading || isNavigating) return <RatingSkeleton />;

    return (
        <div className="pt-2 sm:px-6 lg:px-8">
            <MyBreadcrumb
                paths={[
                    { label: "My School", href: "/public/school-owner" },
                    { label: "Ratings & Feedback" },
                ]}
            />
            <SchoolManageTitle title="Ratings & Feedback" />

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
                        <div className="absolute inset-0 bg-opacity-70 flex items-center justify-center z-10">
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
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Card title="Rating Distribution" className="w-full">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                label={({ name, percent }) =>
                                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                                }
                                                outerRadius={80}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </motion.div>
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                whileHover={{scale: 1.02}}
                            >
                                <Card title="Monthly Reviews" className="w-full">
                                    {barData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={barData}>
                                                <CartesianGrid strokeDasharray="3 3"/>
                                                <XAxis dataKey="month"/>
                                                <YAxis/>
                                                <RechartsTooltip/>
                                                <Bar dataKey="reviews" fill="#8884d8"/>
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
                                    className="w-full sm:w-40 md:w-48 lg:w-56 xl:w-64"
                                />
                            }
                            className="w-full"
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
                                        <List.Item className="!px-2 sm:!px-3 md:!px-4 lg:!px-5 flex flex-col lg:flex-row lg:items-center">
                                            <div className="flex items-center mb-2 lg:mb-0">
                                                <Avatar
                                                    src={item.parentImage}
                                                    className="bg-blue-500 mr-1 sm:mr-2 md:mr-3"
                                                    size={{ xs: 24, sm: 28, md: 32, lg: 36, xl: 40 }}
                                                >
                                                    {item.parentImage || "A"}
                                                </Avatar>
                                                <div className="flex-1">
                                                    <Text strong className="text-sm sm:text-base md:text-lg line-clamp-2">
                                                        {item.feedback || "No feedback provided"}
                                                    </Text>
                                                    <div className="flex flex-col gap-0.5 sm:gap-1 md:gap-1.5 mt-1">
                                                        <Text type="secondary" className="text-xs sm:text-sm">
                                                            {item.parentName || "Anonymous"}
                                                        </Text>
                                                        <div className="flex">
                                                            {[...Array(Math.floor(item.reviewAverage || 0))].map(
                                                                (_, i) => (
                                                                    <StarFilled
                                                                        key={i}
                                                                        className="text-yellow-400 text-xs sm:text-sm"
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                        <Text type="secondary" className="text-xs sm:text-sm">
                                                            {item.receiveDate.isValid()
                                                                ? item.receiveDate.format(
                                                                    window.innerWidth < 640 ? "D MMM YYYY" : "D MMMM YYYY"
                                                                )
                                                                : "Date unavailable"}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-1 sm:gap-2 md:gap-3 lg:ml-auto pr-1 sm:pr-2 md:pr-3">
                                                {(item.status === REVIEW_STATUS.APPROVED) && (
                                                    <MakeReportLink
                                                        onFetching={isFetching && loadingReviewId === item.id}
                                                        onClick={() => openModal({ id: item.id, reason: item.report })}
                                                    />
                                                )}
                                                {(item.status === REVIEW_STATUS.REJECTED) && (
                                                    <Tooltip open={false} placement="topRight" title={item.report} color="red" key="rejected-tooltip">
                                                                    <span className="text-xs text-gray-500 cursor-default">
                                                                        This review will be hidden
                                                                    </span>
                                                    </Tooltip>
                                                )}
                                                {(item.status === REVIEW_STATUS.PENDING) && (
                                                    <Tooltip open={false} placement="topRight" title={item.report} color="red" key="pending-tooltip">
                                                                    <span className="text-xs text-gray-500 cursor-default">
                                                                        This review is waiting for confirm by admin
                                                                    </span>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </List.Item>
                                    </motion.div>
                                )}
                            />
                            {filteredReviews.length > 5 && (
                                <div className="text-center mt-2 sm:mt-3 md:mt-4">
                                    <Button type="link" onClick={() => setShowAll(!showAll)}>
                                        {showAll ? "Show Less" : `View More (${filteredReviews.length - 5})`}
                                    </Button>
                                </div>
                            )}
                            <SchoolOwnerReportModal
                                open={isModalOpen}
                                onSubmit={handleSubmitReport}
                                onCancel={handleCancelModal}
                                reviewId={selectedReport?.id || null}
                                onReporting={isReporting}
                            />
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default RatingsDashboard;