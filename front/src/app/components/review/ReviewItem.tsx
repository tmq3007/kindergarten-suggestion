import React from "react";
import {Avatar, Collapse, Divider, Rate, Row, Col, Typography} from "antd";
import {UserOutlined} from "@ant-design/icons";
import {ReviewVO} from "@/redux/services/reviewApi";
import styles from "./CommentSection.module.css";
import {useAverageRating} from "@/lib/hook/useAvarageRating";

const {Panel} = Collapse;

interface ReviewItemProps {
    review: ReviewVO;
}

const collapseStyle = `
.headerFeedback,
.headerRating {
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 1;
    transform: translateY(0);
}

.ant-collapse-item-active .headerFeedback,
.ant-collapse-item-active .headerRating {
    opacity: 0;
    transform: translateY(-10px);
    animation: fadeOut 0.3s ease forwards;
}

@keyframes fadeOut {
    0% {
        opacity: 1;
        transform: translateY(0);
        height: auto;
        display: block;
    }
    99% {
        opacity: 0;
        height: 0;
        transform: translateY(-10px);
        display: block;
    }
    100% {
        opacity: 0;
        display: none;
    }
}

.bodyFeedback,
.bodyRating {
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 0;
    transform: translateY(10px);
}

.ant-collapse-item-active .bodyFeedback,
.ant-collapse-item-active .bodyRating {
    opacity: 1;
    transform: translateY(0);
}
`;
const ReviewItem: React.FC<ReviewItemProps> = ({review}) => {
    const ratingData = [
        {key: "overall", category: "Overall Rating:", rating: useAverageRating(review)},
        {key: "learningProgram", category: "Learning program:", rating: review.learningProgram},
        {key: "facilitiesAndUtilities", category: "Facilities and Utilities:", rating: review.facilitiesAndUtilities},
        {
            key: "extracurricularActivities",
            category: "Extracurricular Activities:",
            rating: review.extracurricularActivities
        },
        {key: "teachersAndStaff", category: "Teachers and Staff:", rating: review.teacherAndStaff},
        {key: "hygieneAndNutrition", category: "Hygiene and Nutrition:", rating: review.hygieneAndNutrition},
    ];

    return (
        <>
            <style>{collapseStyle}</style>
            <Collapse className={`${styles.collapse} w-full mx-2 md:m-2 bg-white`}>
                <Panel
                    header={
                        <Row gutter={[8, 8]} align="middle" className="py-2 md:py-0">
                            <Col>
                                <Avatar
                                    size={{xs: 36, md: 48}}
                                    src={review.parentImage}
                                    icon={!review.parentImage && <UserOutlined/>}
                                    className="bg-gray-200"
                                />
                            </Col>
                            <Col flex="auto">
                                <div
                                    className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                                    <div className={styles.headerText}>
                                        <div className="flex flex-col">
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className="font-bold text-sm md:text-base">{review.parentName}</span>
                                                <span
                                                    className="text-gray-500 text-xs md:text-sm">{review.receiveDate}</span>
                                            </div>
                                            <div className={`headerFeedback text-gray-700 mt-1 text-sm md:text-base`}>
                                                <Typography.Paragraph
                                                    ellipsis={{rows: 1}}
                                                >
                                                    {review.feedback}
                                                </Typography.Paragraph>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`headerRating flex items-center space-x-2`}>
                                        <span className="text-xs md:text-sm hidden md:inline">Overall Rating</span>
                                        <Rate disabled value={useAverageRating(review)} className={styles.rate}/>
                                        <span className="font-bold text-sm md:text-base">{useAverageRating(review)}/5</span>
                                    </div>
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
                                <Typography.Paragraph
                                    ellipsis={{rows: 8, expandable: "collapsible"}}
                                    className="text-sm md:text-lg font-sans"
                                >
                                    {review.feedback}
                                </Typography.Paragraph>
                            </div>
                        </Col>
                        <Col xs={0} md={1}>
                            <Divider type="vertical" className={styles.dividerVertical}/>
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
                                        <span
                                            className="text-sm md:text-base w-full md:w-[200px]">{item.category}</span>
                                        <div className="flex items-center">
                                            <Rate
                                                disabled
                                                value={item.rating}
                                                className={item.key === "overall" ? styles.rateOverall : styles.rateExpanded}
                                            />
                                            <span className="ml-2 text-sm md:text-base">({item.rating}/5)</span>
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