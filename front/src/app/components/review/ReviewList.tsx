import React from "react";
import { List } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import ReviewItem from "./ReviewItem";
import { ReviewVO } from "@/redux/services/reviewApi";

interface ReviewListProps {
    displayedReviews: ReviewVO[];
    hasMore: boolean;
    loadMoreData: () => void;
    shortenFeedback: (feedback: string, maxLength?: number) => string;
}

const ReviewList: React.FC<ReviewListProps> = ({
                                                   displayedReviews,
                                                   hasMore,
                                                   loadMoreData,
                                                   shortenFeedback,
                                               }) => {
    return (
        <div>
            {displayedReviews.length === 0 ? (
                <p>No comments available yet. Be the first to leave a comment!</p>
            ) : (
                <InfiniteScroll
                    dataLength={displayedReviews.length}
                    next={loadMoreData}
                    hasMore={hasMore}
                    loader={<h4>Loading...</h4>}
                    endMessage={<p style={{ textAlign: "center" }}>No more comments to load.</p>}
                >
                    <List
                        dataSource={displayedReviews}
                        renderItem={(review) => (
                            <List.Item key={review.id}>
                                <ReviewItem review={review} shortenFeedback={shortenFeedback} />
                            </List.Item>
                        )}
                    />
                </InfiniteScroll>
            )}
        </div>
    );
};

export default ReviewList;