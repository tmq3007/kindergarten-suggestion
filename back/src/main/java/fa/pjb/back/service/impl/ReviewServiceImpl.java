package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._13xx_school.ReviewNotFoundException;
import fa.pjb.back.model.dto.ReviewAcceptDenyDTO;
import fa.pjb.back.model.dto.ReviewReportDTO;
import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.enums.EReviewStatus;
import fa.pjb.back.model.mapper.ReviewMapper;
import fa.pjb.back.model.vo.ReviewReportReminderVO;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.service.ReviewService;
import fa.pjb.back.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final UserService userService;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    public List<ReviewVO> getAllReviewByAdmin(Integer schoolId, LocalDate fromDate, LocalDate toDate, String status) {
        Byte statusByte = null;
        if (status != null) {
            switch (status.toUpperCase()) {
                case "APPROVED":
                    statusByte = (byte) 0;
                    break;
                case "REJECTED":
                    statusByte = (byte) 1;
                    break;
                case "PENDING":
                    statusByte = (byte) 2;
                    break;
                default:
                    throw new IllegalArgumentException("Invalid status value. Use: APPROVED, REJECTED, or PENDING");
            }
        }

        List<Review> reviews = reviewRepository.findAllBySchoolIdWithDateRangeAdmin(schoolId, fromDate, toDate, statusByte);
        log.info("reviews: {}", reviews.get(0).getStatus());
        if (reviews.isEmpty()) {
            throw new ReviewNotFoundException();
        }
        return reviewMapper.toReviewVOList(reviews);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    public List<ReviewVO> getAllReviewBySchoolOwner(LocalDate fromDate, LocalDate toDate, String status){
        SchoolOwner schoolOwner = userService.getCurrentSchoolOwner();
        School school = schoolOwner.getSchool();
        Byte statusByte = null;
        if (status != null) {
            switch (status.toUpperCase()) {
                case "APPROVED":
                    statusByte = (byte) 0;
                    break;
                case "REJECTED":
                    statusByte = (byte) 1;
                    break;
                case "PENDING":
                    statusByte = (byte) 2;
                    break;
                default:
                    throw new IllegalArgumentException("Invalid status value. Use: APPROVED, REJECTED, or PENDING");
            }
        }

        List<Review> reviews = reviewRepository.findAllBySchoolIdWithDateRangeSO(school.getId(), fromDate, toDate,statusByte);
        if (reviews.isEmpty()) {
            throw new ReviewNotFoundException();
        }
        return reviewMapper.toReviewVOList(reviews);
    }

    @Override
    public List<ReviewVO> getTop4RecentFiveStarFeedbacks() {
        List<Review> reviews = reviewRepository.getTop4RecentFiveStarFeedbacks(PageRequest.of(0, 4));

        if (reviews.isEmpty()) {
            throw new ReviewNotFoundException();
        }
        return reviewMapper.toReviewVOList(reviews);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    public ReviewVO makeReport(ReviewReportDTO reviewReportDTO) {
        Review review = reviewRepository.findById(reviewReportDTO.id()).orElse(null);

        if(review == null){
            throw new ReviewNotFoundException();
        }

        if (review.getStatus() != EReviewStatus.APPROVED.getValue()) {
            throw new IllegalStateException("Review is not approved");
        }

        review.setReport(reviewReportDTO.reason());
        review.setStatus(EReviewStatus.PENDING.getValue());

        return reviewMapper.toReviewVO((review));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ReviewVO acceptReport(ReviewAcceptDenyDTO reviewAcceptDenyDTO) {
        Review review = reviewRepository.findById(reviewAcceptDenyDTO.id()).orElse(null);

        if(review == null){
            throw new ReviewNotFoundException();
        }

        if (reviewAcceptDenyDTO.decision() == null) {
            throw new IllegalArgumentException("Decision cannot be null");
        }

        if (review.getStatus() != EReviewStatus.PENDING.getValue()) {
            throw new IllegalStateException("Review is not pending");
        }

        if(reviewAcceptDenyDTO.decision()){
            review.setStatus((byte) 1);
        }else {
            review.setStatus((byte) 0);
        }

        return reviewMapper.toReviewVO((review));
    }

    @Override
    public List<ReviewReportReminderVO> getReviewReportReminders() {
        // Fetch all reviews with PENDING status
        List<Review> reviews = reviewRepository.findAllByStatus(EReviewStatus.PENDING.getValue());

        if (reviews.isEmpty()) {
            throw new ReviewNotFoundException();
        }

        // Group reviews by schoolId and count the total for each school
        Map<Integer, Long> reviewCountBySchoolId = reviews.stream()
                .collect(Collectors.groupingBy(
                        review -> review.getSchool().getId(), // Assuming Review has a getSchool() method returning School
                        Collectors.counting()
                ));

        // Convert the grouped data into ReviewReportReminderVO list
        // Fetch school name (assuming Review has a reference to School entity)
        // Fallback if school name not found
        // Convert Long to Integer

        return reviewCountBySchoolId.entrySet().stream()
                .map(entry -> {
                    Integer schoolId = entry.getKey();
                    Long total = entry.getValue();
                    // Fetch school name (assuming Review has a reference to School entity)
                    String schoolName = reviews.stream()
                            .filter(review -> review.getSchool().getId().equals(schoolId))
                            .findFirst()
                            .map(review -> review.getSchool().getName())
                            .orElse("Unknown School"); // Fallback if school name not found
                    return ReviewReportReminderVO.builder()
                            .schoolId(schoolId)
                            .schoolName(schoolName)
                            .total(total.intValue()) // Convert Long to Integer
                            .build();
                })
                .collect(Collectors.toList());
    }


}