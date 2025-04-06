import React from "react";
import { Avatar, Collapse, Divider, Rate, Row, Col, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ReviewVO } from "@/redux/services/reviewApi";

const { Panel } = Collapse;

interface ReviewItemProps {
    review: ReviewVO;
    shortenFeedback: (feedback: string, maxLength?: number) => string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, shortenFeedback }) => {
    const ratingData = [
        {
            key: "overall",
            category: "Overall Rating:",
            rating: review.average,
        },
        {
            key: "learningProgram",
            category: "Learning program:",
            rating: review.learningProgram,
        },
        {
            key: "facilitiesAndUtilities",
            category: "Facilities and Utilities:",
            rating: review.facilitiesAndUtilities,
        },
        {
            key: "extracurricularActivities",
            category: "Extracurricular Activities:",
            rating: review.extracurricularActivities,
        },
        {
            key: "teachersAndStaff",
            category: "Teachers and Staff:",
            rating: review.teacherAndStaff,
        },
        {
            key: "hygieneAndNutrition",
            category: "Hygiene and Nutrition:",
            rating: review.hygieneAndNutrition,
        },
    ];

    return (
        <Collapse className="w-full mx-2 md:m-2 bg-white">
            <Panel
                header={
                    <Row gutter={[8, 8]} align="middle" className="py-2 md:py-0">
                        <Col>
                            <Avatar
                                size={{ xs: 36, md: 48 }}
                                src={review.parentImage}
                                icon={!review.parentImage && <UserOutlined />}
                                className="bg-gray-200"
                            />
                        </Col>
                        <Col flex="auto">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                                <div className="header-text">
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-sm md:text-base">{review.parentName}</span>
                                            <span className="text-gray-500 text-xs md:text-sm">{review.receiveDate}</span>
                                        </div>
                                        <p className="text-gray-700 mt-1 header-feedback text-sm md:text-base">
                                            {shortenFeedback(review.feedback)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center header-rating space-x-2">
                                    <span className="text-xs md:text-sm hidden md:inline">Overall Rating</span>
                                    <Rate disabled value={review.average} className="text-xs md:text-sm" />
                                    <span className="font-bold text-sm md:text-base">{review.average}/5</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                }
                key={review.id.toString()}
            >
                <Row gutter={[8, 8]} align="top" className="py-2 md:py-0 px-2 md:px-0">
                    <Col xs={24} md={13}>
                        <div className="flex items-start mb-2">
                            <Typography.Paragraph
                                ellipsis={{ rows: 8, expandable: "collapsible" }}
                                className="text-sm md:text-lg font-sans"
                            >
                                {review.feedback}
                            </Typography.Paragraph>
                        </div>
                    </Col>
                    <Col xs={0} md={1}>
                        <Divider type="vertical" className="h-auto" />
                    </Col>
                    <Col xs={24} md={10}>
                        <div className="space-y-2 md:space-y-1">
                            {ratingData.map((item) => (
                                <div
                                    key={item.key}
                                    className={`flex flex-col md:flex-row md:items-center ${
                                        item.key === "overall" ? "bg-[#fffbe6] font-bold" : ""
                                    } p-2 md:p-1 rounded-md`}
                                >
                                    <span className="text-sm md:text-base w-full md:w-[200px]">{item.category}</span>
                                    <div className="flex items-center">
                                        <Rate
                                            disabled
                                            value={item.rating}
                                            className={`${
                                                item.key === "overall"
                                                    ? "ant-rate-overall text-[12px] md:text-base"
                                                    : "ant-rate-expanded text-[12px] md:text-base"
                                            }`}
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
    );
};

export default ReviewItem;