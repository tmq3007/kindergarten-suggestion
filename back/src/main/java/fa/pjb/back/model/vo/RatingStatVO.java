package fa.pjb.back.model.vo;

import java.util.Map;

public record RatingStatVO(
        double averageRating,
        long totalRatings,
        Map<String, Integer> ratingsByStarRange,
        Map<String, Double> categoryRatings
) {
}
