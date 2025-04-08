// CommentSection.tsx


import React, { FunctionComponent, useState } from "react";
import {ReviewVO, useGetReviewStatsBySchoolQuery} from "@/redux/services/reviewApi";
import ReviewFilterTabs from "@/app/components/review/ReviewFilterTabs";
import ReviewList from "@/app/components/review/ReviewList";
import AverageRatingSection from "@/app/components/review/AverageRatingSection";
import styles from "./CommentSection.module.css";

interface OwnProps {
    reviews: ReviewVO[];
    schoolId: number;
}

type Props = OwnProps;

const CommentSection: FunctionComponent<Props> = ({ reviews, schoolId }) => {
    const [selectedRating, setSelectedRating] = useState<string>("all");
    const { data: statsData, isLoading, isError } = useGetReviewStatsBySchoolQuery(schoolId);

    const handleTabChange = (key: string) => {
        setSelectedRating(key);
    };

    return (
        <div className={styles.container}>
            <AverageRatingSection dataStat={statsData?.data} isError={isError} isLoading={isLoading} />
            <div className="mb-4">
                <h2 className="text-lg md:text-xl font-bold mb-2">Details</h2>
                <ReviewFilterTabs onTabChange={handleTabChange} isLoading={isLoading} statsData={statsData?.data}/>
            </div>
            <ReviewList
                initialReviews={reviews}
                schoolId={schoolId}
                selectedRating={selectedRating}
            />
        </div>
    );
};

export default CommentSection;