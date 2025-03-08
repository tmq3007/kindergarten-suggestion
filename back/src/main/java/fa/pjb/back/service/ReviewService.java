package fa.pjb.back.service;

import fa.pjb.back.model.vo.ReviewVO;

import java.time.LocalDate;
import java.util.List;

public interface ReviewService {
    List<ReviewVO> getAllReview(Integer schoolId, LocalDate fromDate, LocalDate toDate);

    List<ReviewVO> getTop4RecentFiveStarFeedbacks();
}
