import React from "react";
import { Avatar, Collapse, Divider, Rate, Row, Col, Typography, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ReviewVO } from "@/redux/services/reviewApi";
import styles from "./CommentSection.module.css";
import { useAverageRating } from "@/lib/hook/useAvarageRating";
import { REVIEW_STATUS } from "@/lib/constants";
import {MakeReportLink, ViewReportLink} from "@/app/components/review/ReviewButton";
import dayjs from "dayjs";

const { Panel } = Collapse;
const { Paragraph, Text } = Typography;

interface ReviewItemProps {
    review: ReviewVO;
    isFetching?: boolean;
    loadingReviewId?: number | null;
    onReportClick?: (item: { id: number; reason: string | undefined }) => void;
    onViewReportClick?: (item: { id: number; report: string | undefined }) => void;
    userRole?: string;
}
const collapseStyle = `
.headerFeedback,
.headerRating {
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;
    transform: translateY(0) scaleY(1);
    transform-origin: top;
    position: relative;
    max-height: 100px;
    overflow: hidden;
}

.ant-collapse-item-active .headerFeedback,
.ant-collapse-item-active .headerRating {
    opacity: 0;
    transform: translateY(-8px) scaleY(0.8);
    animation: smoothHeightCollapse 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

@keyframes smoothHeightCollapse {
    0% {
        opacity: 1;
        transform: translateY(0) scaleY(1);
        max-height: 100px;
        margin-top: 4px;
        visibility: visible;
    }
    40% {
        opacity: 0.6;
        transform: translateY(-5px) scaleY(0.7);
        max-height: 60px;
        margin-top: 2px;
    }
    100% {
        opacity: 0;
        transform: translateY(-8px) scaleY(0);
        max-height: 0;
        margin-top: 0;
        visibility: hidden;
    }
}

.bodyFeedback,
.bodyRating {
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: translateY(10px);
}

.ant-collapse-item-active .bodyFeedback,
.ant-collapse-item-active .bodyRating {
    opacity: 1;
    transform: translateY(0);
}
`;

const ReviewItem: React.FC<ReviewItemProps> = ({
                                                   review,
                                                   isFetching = false,
                                                   loadingReviewId = null,
                                                   onReportClick,
                                                   onViewReportClick,
                                                   userRole
                                               }) => {
    const averageRating = useAverageRating(review);
    const receiveDate = dayjs(review.receiveDate).isValid()
        ? dayjs(review.receiveDate).format("D MMM YYYY")
        : "Date unavailable";

    const ratingData = [
        { key: "overall", category: "Overall Rating:", rating: averageRating },
        { key: "learningProgram", category: "Learning program:", rating: review.learningProgram },
        { key: "facilitiesAndUtilities", category: "Facilities and Utilities:", rating: review.facilitiesAndUtilities },
        { key: "extracurricularActivities", category: "Extracurricular Activities:", rating: review.extracurricularActivities },
        { key: "teachersAndStaff", category: "Teachers and Staff:", rating: review.teacherAndStaff },
        { key: "hygieneAndNutrition", category: "Hygiene and Nutrition:", rating: review.hygieneAndNutrition },
    ];

    return (
        <>
            <style>{collapseStyle}</style>
            <Collapse className={`${styles.collapse} w-full mx-2 md:m-2 bg-white`}>
                <Panel
                    header={
                        <Row gutter={[16, 8]} align="middle" className="w-full">
                            {/* Cột 1: Thông tin người review và ngày */}
                            <Col xs={24} md={16}>
                                <div className="flex items-start">
                                    <Avatar
                                        size={{ xs: 36, md: 48 }}
                                        src={review.parentImage}
                                        icon={!review.parentImage && <UserOutlined />}
                                        className="bg-gray-200 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex flex-col">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-sm md:text-base">
                                                    {review.parentName || "Anonymous"}
                                                </span>
                                                <span className="text-gray-500 text-xs md:text-sm">
                                                    {receiveDate}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {/* Hiển thị khác nhau tùy theo vai trò */}
                                                    {userRole === 'ROLE_SCHOOL_OWNER' ? (
                                                        <>
                                                            {review.status === REVIEW_STATUS.APPROVED && (
                                                                <MakeReportLink
                                                                    onFetching={isFetching && loadingReviewId === review.id}
                                                                    onClick={() => onReportClick && onReportClick({
                                                                        id: review.id,
                                                                        reason: review.report
                                                                    })}
                                                                />
                                                            )}
                                                            {review.status === REVIEW_STATUS.REJECTED && (
                                                                <Tooltip title={review.report} color="blue">
                                                                    <span className="text-xs text-gray-500 cursor-default">
                                                                        (Hidden)
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                            {review.status === REVIEW_STATUS.PENDING && (
                                                                <Tooltip title={review.report} color="blue">
                                                                    <span className="text-xs text-gray-500 cursor-default">
                                                                        (Pending)
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                        </>
                                                    ) : (
                                                        // Hiển thị cho ADMIN
                                                        <>
                                                            {review.status === REVIEW_STATUS.PENDING && review.report && (
                                                                <ViewReportLink
                                                                    onClick={() => onViewReportClick && onViewReportClick({
                                                                        id: review.id,
                                                                        report: review.report
                                                                    })}
                                                                    disabled={false}
                                                                    onFetching={isFetching && loadingReviewId === review.id}
                                                                />
                                                            )}
                                                            {review.status === REVIEW_STATUS.REJECTED && (
                                                                <Tooltip title={review.report} color="gray">
                                                                    <span className="text-xs text-gray-500 cursor-default">
                                                                         (Hidden)
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`headerFeedback text-gray-700 mt-1 text-sm md:text-base`}>
                                                <Paragraph ellipsis={{ rows: 2 }}>
                                                    {review.feedback || "No feedback provided"}
                                                </Paragraph>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            {/* Cột 2: Đánh giá tổng quan */}
                            <Col xs={24} md={8}>
                                <div className={`headerRating flex justify-center items-center space-x-2 mt-2 md:mt-0`}>
                                    <span className="text-xs md:text-sm hidden md:inline">Overall Rating</span>
                                    <Rate disabled value={averageRating} className={styles.rate} />
                                    <span className="font-bold text-sm md:text-base">{averageRating} /5</span>
                                </div>
                            </Col>
                        </Row>
                    }
                    key={review.id.toString()}
                    className={styles.collapseItem}
                >
                    <Row gutter={[8, 8]} align="top" className="py-2 md:py-0 px-2 md:px-0">
                        <Col xs={24} md={13}>
                            <div className="flex items-start mb-2">
                                <Paragraph
                                    ellipsis={{ rows: 8, expandable: "collapsible" }}
                                    className="text-sm font-sans"
                                >
                                    {review.feedback || "No feedback provided"}
                                </Paragraph>
                            </div>
                        </Col>
                        <Col xs={0} md={1}>
                            <Divider type="vertical" className={styles.dividerVertical} />
                        </Col>
                        <Col xs={24} md={10}>
                            <div className="space-y-2 md:space-y-1">
                                {ratingData.map((item) => (
                                    <div
                                        key={item.key}
                                        className={`flex flex-col md:flex-row md:items-center ${
                                            item.key === "overall" ? styles.overallRatingRow : ""
                                        } p-2 md:p-1 rounded-md`}
                                    >
                                        <span className="text-sm w-full md:w-[200px]">
                                            {item.category}
                                        </span>
                                        <div className="flex items-center">
                                            <Rate
                                                disabled
                                                value={item.rating}
                                                className={
                                                    item.key === "overall"
                                                        ? styles.rateOverall
                                                        : styles.rateExpanded
                                                }
                                            />
                                            <span className="ml-2 text-sm md:text-base">
                                                ({item.rating}/5)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Panel>
            </Collapse>
        </>
    );
};

export default ReviewItem;