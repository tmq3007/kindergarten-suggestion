// ReviewList.tsx
"use client";
import React, { useState, useEffect } from "react";
import { List, Button } from "antd";
import ReviewItem from "./ReviewItem";
import { ReviewVO } from "@/redux/services/reviewApi";
import { useGetReviewBySchoolForPublicQuery } from "@/redux/services/reviewApi";

interface ReviewListProps {
    initialReviews: ReviewVO[];
    schoolId: number;
    selectedRating: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
                                                   initialReviews,
                                                   schoolId,
                                                   selectedRating,
                                               }) => {
    const [page, setPage] = useState(1);
    const [displayedReviews, setDisplayedReviews] = useState<ReviewVO[]>(initialReviews || []);
    const pageSize = 15;

    const starFilter = selectedRating === "all" ? undefined : parseInt(selectedRating);

    const { data, isLoading, isFetching } = useGetReviewBySchoolForPublicQuery({
        schoolId: Number(schoolId),
        page: page, // Convert to 0-based index for API
        size: pageSize,
        star: starFilter,
    });

    // Reset when filter changes
    useEffect(() => {
        setPage(1);
        setDisplayedReviews([]); // Clear existing reviews
    }, [selectedRating]);

    // Handle data updates
    useEffect(() => {
        // Handle API data
        if (data?.data?.content) {
            const newReviews = Array.isArray(data.data.content) ? data.data.content : [];
            setDisplayedReviews((prev) =>
                page === 1 ? newReviews : [...prev, ...newReviews]
            );
        }
    }, [data, page, initialReviews]);

    const hasMore = data?.data?.page
        ? page < data.data.page.totalPages
        : false;

    const loadMoreData = () => {
        if (!isFetching && hasMore) {
            setPage((prev) => prev + 1);
        }
    };

    const loadMore = !isLoading && !isFetching && hasMore ? (
        <div style={{ textAlign: "center", marginTop: 12, height: 32, lineHeight: "32px" }}>
            <Button onClick={loadMoreData} loading={isFetching}>
                Load more
            </Button>
        </div>
    ) : null;

    return (
        <div>
            {displayedReviews.length === 0 && !isLoading ? (
                <p>No comments available yet. Be the first to leave a comment!</p>
            ) : (
                <List
                    loading={isLoading && page === 1}
                    dataSource={displayedReviews}
                    loadMore={loadMore}
                    renderItem={(review) => (
                        <List.Item key={review.id}>
                            <ReviewItem review={review} />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default ReviewList;