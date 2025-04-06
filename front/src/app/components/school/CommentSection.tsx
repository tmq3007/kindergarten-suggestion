"use client";
import React, {FunctionComponent, useState, useEffect} from "react";
import {ReviewVO} from "@/redux/services/reviewApi";
import ReviewFilterTabs from "@/app/components/review/ReviewFilterTabs";
import ReviewList from "@/app/components/review/ReviewList";
import AverageRatingSection from "@/app/components/review/AverageRatingSection";

interface OwnProps {
    reviews: ReviewVO[];
}

type Props = OwnProps;

const CommentSection: FunctionComponent<Props> = ({reviews}) => {
    const styles = `
    .ant-tabs {
  margin-bottom: 16px;
}

.ant-tabs-tab {
  padding: 6px 12px;
  border-radius: 20px;
  margin-right: 4px;
  font-size: 14px;
  color: #000;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .ant-tabs-tab {
    padding: 8px 16px;
    margin-right: 8px;
    font-size: 16px;
  }
}

.ant-tabs-tab-active {
  color: #000 !important;
}

.ant-tabs-tab:hover {
  background-color: #fadb14;
  color: #000;
}

.ant-progress-text {
  font-size: 12px;
  color: #000;
}

@media (min-width: 768px) {
  .ant-progress-text {
    font-size: 14px;
  }
}

.ant-rate {
  color: #fadb14;
}

.ant-rate-expanded {
  font-size: 16px;
}

@media (min-width: 768px) {
  .ant-rate-expanded {
    font-size: 20px;
  }
}

.ant-rate-overall {
  font-size: 20px;
}

@media (min-width: 768px) {
  .ant-rate-overall {
    font-size: 24px;
  }
}

.ant-divider-vertical {
  height: auto;
  border-left: 1px solid #d9d9d9;
  display: none;
}

@media (min-width: 768px) {
  .ant-divider-vertical {
    display: block;
  }
}

.ant-collapse {
  border: none !important;
  background: transparent !important;
}

.ant-collapse > .ant-collapse-item {
  border-bottom: 1px solid #d9d9d9 !important;
}

.ant-collapse-header {
  align-items: center !important;
  padding: 8px 0 !important;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .ant-collapse-header {
    padding: 12px 0 !important;
  }
}

.ant-collapse-content-box {
  padding: 12px 0 !important;
}

@media (min-width: 768px) {
  .ant-collapse-content-box {
    padding: 16px 0 !important;
  }
}

.ant-table {
  background: transparent !important;
}

.ant-table-thead > tr > th {
  background: transparent !important;
  font-weight: bold;
  border-bottom: 1px solid #d9d9d9 !important;
  padding: 8px 4px !important;
}

@media (min-width: 768px) {
  .ant-table-thead > tr > th {
    padding: 8px !important;
  }
}

.ant-table-tbody > tr > td {
  border-bottom: 1px solid #d9d9d9 !important;
  padding: 8px 4px !important;
}

@media (min-width: 768px) {
  .ant-table-tbody > tr > td {
    padding: 8px !important;
  }
}

.ant-table-tbody > tr:last-child > td {
  border-bottom: none !important;
}

.overall-rating-row {
  background-color: #fffbe6;
  font-weight: bold;
  font-size: 14px;
}

@media (min-width: 768px) {
  .overall-rating-row {
    font-size: 16px;
  }
}

.overall-rating-row td {
  padding: 8px 4px !important;
}

@media (min-width: 768px) {
  .overall-rating-row td {
    padding: 12px 8px !important;
  }
}

.header-feedback,
.header-rating {
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.ant-collapse-item-active .header-feedback,
.ant-collapse-item-active .header-rating {
  opacity: 0;
  transform: translateY(-10px);
  animation: fadeOut 0.3s ease forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translateY(0);
    display: block;
  }
  99% {
    opacity: 0;
    transform: translateY(-10px);
    display: block;
  }
  100% {
    opacity: 0;
    display: none;
  }
}

.body-feedback,
.body-rating {
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 0;
  transform: translateY(10px);
}

.ant-collapse-item-active .body-feedback,
.ant-collapse-item-active .body-rating {
  opacity: 1;
  transform: translateY(0);
}

.ant-list-item {
  padding: 0 !important;
}

.header-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: auto;
  min-height: 36px;
}

@media (min-width: 768px) {
  .header-text {
    min-height: 48px;
  }
}
  `;

    const [filteredReviews, setFilteredReviews] = useState<ReviewVO[]>(reviews);
    const [displayedReviews, setDisplayedReviews] = useState<ReviewVO[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const handleTabChange = (key: string) => {
        if (key === "all") {
            setFilteredReviews(reviews);
        } else {
            const rating = parseInt(key);
            setFilteredReviews(reviews.filter((review) => Math.round(review.average) === rating));
        }
        setDisplayedReviews([]);
        setHasMore(true);
        loadMoreData();
    };

    const loadMoreData = () => {
        const currentLength = displayedReviews.length;
        const newReviews = filteredReviews.slice(currentLength, currentLength + pageSize);

        if (newReviews.length === 0) {
            setHasMore(false);
            return;
        }

        setDisplayedReviews((prev) => [...prev, ...newReviews]);
    };

    useEffect(() => {
        setFilteredReviews(reviews);
        setDisplayedReviews(reviews.slice(0, pageSize));
        setHasMore(reviews.length > pageSize);
    }, [reviews]);

    const shortenFeedback = (feedback: string, maxLength: number = 100) => {
        if (feedback.length <= maxLength) return feedback;
        return feedback.substring(0, maxLength) + "...";
    };

    return (
        <>
            <style>{styles}</style>
            <div className="w-full">
                <AverageRatingSection reviews={reviews}/>
                <div className="mb-4">
                    <h2 className="text-lg md:text-xl font-bold mb-2">Details</h2>
                    <ReviewFilterTabs onTabChange={handleTabChange}/>
                </div>
                <ReviewList
                    displayedReviews={displayedReviews}
                    hasMore={hasMore}
                    loadMoreData={loadMoreData}
                    shortenFeedback={shortenFeedback}
                />
            </div>
        </>
    );
};

export default CommentSection;