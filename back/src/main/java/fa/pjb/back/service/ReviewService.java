package fa.pjb.back.service;

import fa.pjb.back.model.dto.ReviewAcceptDenyDTO;
import fa.pjb.back.model.dto.ReviewReportDTO;
import fa.pjb.back.model.vo.RatingStatVO;
import fa.pjb.back.model.vo.ReviewReportReminderVO;
import fa.pjb.back.model.vo.ReviewVO;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface ReviewService {

    List<ReviewVO> getAllReviewByAdmin(Integer schoolId, LocalDate fromDate, LocalDate toDate, String status);

    List<ReviewVO> getAllReviewBySchoolOwner(LocalDate fromDate, LocalDate toDate, String status);

    List<ReviewVO> getTop4RecentFiveStarFeedbacks();

    ReviewVO makeReport(ReviewReportDTO reviewReportDTO);

    ReviewVO acceptReport(ReviewAcceptDenyDTO reviewAcceptDenyDTO);

    List<ReviewReportReminderVO> getReviewReportReminders();

    RatingStatVO getReviewStatsBySchool(Integer schoolId);

    Page<ReviewVO> getReviewListBySchoolForPublic(Integer schoolId, Integer page, Integer size, Integer star);
}
