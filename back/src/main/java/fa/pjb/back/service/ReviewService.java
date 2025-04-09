package fa.pjb.back.service;

import fa.pjb.back.model.dto.ReviewAcceptDenyDTO;
import fa.pjb.back.model.dto.ReviewDTO;
import fa.pjb.back.model.dto.ReviewReportDTO;
import fa.pjb.back.model.vo.RatingStatVO;
import fa.pjb.back.model.vo.ReviewReportReminderVO;
import fa.pjb.back.model.vo.ReviewVO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReviewService {

    List<ReviewVO> getAllReviewByAdmin(Integer schoolId, LocalDateTime fromDate, LocalDateTime toDate, String status);

    List<ReviewVO> getAllReviewBySchoolOwner(LocalDateTime fromDate, LocalDateTime toDate, String status);

    List<ReviewVO> getTop4RecentFiveStarFeedbacks();

    ReviewVO makeReport(ReviewReportDTO reviewReportDTO);

    ReviewVO acceptReport(ReviewAcceptDenyDTO reviewAcceptDenyDTO);

    List<ReviewReportReminderVO> getReviewReportReminders();

    RatingStatVO getReviewStatsBySchool(Integer schoolId);

    Page<ReviewVO> getReviewListBySchoolForPublic(Integer schoolId, Integer page, Integer size, Integer star);

    ReviewVO getReviewBySchoolAndParent(Integer schoolId, Integer parentId);

    ReviewVO saveReview( ReviewDTO reviewData);
}
