package fa.pjb.back.service;

import fa.pjb.back.model.vo.ReviewVO;

import java.util.List;

public interface ReviewService {
    List<ReviewVO> getAllReview(Integer schoolId);

    List<ReviewVO> getTop4RecentFiveStarFeedbacks();
}
