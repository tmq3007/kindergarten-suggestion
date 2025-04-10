package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._13xx_school.ReviewNotFoundException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.model.dto.ReviewAcceptDenyDTO;
import fa.pjb.back.model.dto.ReviewDTO;
import fa.pjb.back.model.dto.ReviewReportDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.enums.EReviewStatus;
import fa.pjb.back.model.mapper.ReviewMapper;
import fa.pjb.back.model.mapper.ReviewProjection;
import fa.pjb.back.model.vo.RatingStatVO;
import fa.pjb.back.model.vo.ReviewReportReminderVO;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.ReviewService;
import fa.pjb.back.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
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
    private final SchoolRepository schoolRepository;
    private final ParentRepository parentRepository;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    public List<ReviewVO> getAllReviewByAdmin(Integer schoolId, LocalDate fromDate, LocalDate toDate, String status) {
        Byte statusByte = null;
        if (status != null) {
            statusByte = switch (status.toUpperCase()) {
                case "APPROVED" -> (byte) 0;
                case "REJECTED" -> (byte) 1;
                case "PENDING" -> (byte) 2;
                default ->
                        throw new IllegalArgumentException("Invalid status value. Use: APPROVED, REJECTED, or PENDING");
            };
        }

        List<Review> reviews = reviewRepository.findAllBySchoolIdWithDateRangeAdmin(schoolId, fromDate, toDate, statusByte);
        if (reviews.isEmpty()) {
            throw new ReviewNotFoundException();
        }
        return reviewMapper.toReviewVOList(reviews);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    public List<ReviewVO> getAllReviewBySchoolOwner(LocalDate fromDate, LocalDate toDate, String status) {
        SchoolOwner schoolOwner = userService.getCurrentSchoolOwner();
        School school = schoolOwner.getSchool();
        Byte statusByte = null;
        if (status != null) {
            statusByte = switch (status.toUpperCase()) {
                case "APPROVED" -> (byte) 0;
                case "REJECTED" -> (byte) 1;
                case "PENDING" -> (byte) 2;
                default ->
                        throw new IllegalArgumentException("Invalid status value. Use: APPROVED, REJECTED, or PENDING");
            };
        }

        List<Review> reviews = reviewRepository.findAllBySchoolIdWithDateRangeSO(school.getId(), fromDate, toDate, statusByte);
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
        Review review = reviewRepository.findByReviewId(reviewReportDTO.id()).orElse(null);

        if (review == null) {
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
        Review review = reviewRepository.findByReviewId(reviewAcceptDenyDTO.id()).orElse(null);

        if (review == null) {
            throw new ReviewNotFoundException();
        }

        if (reviewAcceptDenyDTO.decision() == null) {
            throw new IllegalArgumentException("Decision cannot be null");
        }

        if (review.getStatus() != EReviewStatus.PENDING.getValue()) {
            throw new IllegalStateException("Review is not pending");
        }

        if (reviewAcceptDenyDTO.decision()) {
            review.setStatus((byte) 1);
        } else {
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

    @Override
    public Page<ReviewVO> getReviewListBySchoolForPublic(Integer schoolId, Integer page, Integer size, Integer star) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<ReviewProjection> projections = reviewRepository.findReviewWithStarFilter(
                schoolId,
                pageable,
                star);

        return projections.map(reviewMapper::toReviewVOFromProjection);
    }

    @Override
    public ReviewVO getReviewBySchoolAndParent(Integer schoolId) {
       Integer parentId = userService.getCurrentUser().getParent().getId();

        Review review = reviewRepository.findBySchoolIdAndParentId(schoolId, parentId);

        if (review == null) {
            throw new ReviewNotFoundException();
        }
        return reviewMapper.toReviewVO(review);

    }

    @PreAuthorize("hasRole('ROLE_PARENT')")
    @Transactional
    @Override
    public ReviewVO saveReview(ReviewDTO reviewData) {
        if (reviewData.id() == null) {
            // Fetch School and Parent entities
            School school = schoolRepository.findById(reviewData.schoolId())
                    .orElseThrow(SchoolNotFoundException::new);
            Parent parent = userService.getCurrentUser().getParent();

            // Set embedded ID
            ReviewId reviewId = new ReviewId();
            reviewId.setParentId(parent.getId());
            reviewId.setSchoolId(school.getId());

            // Build the Review entity
            Review temp = Review.builder()
                    .primaryId(reviewId)
                    .school(school)
                    .parent(parent)
                    .facilitiesAndUtilities(reviewData.facilitiesAndUtilities())
                    .extracurricularActivities(reviewData.extracurricularActivities())
                    .hygieneAndNutrition(reviewData.hygieneAndNutrition())
                    .learningProgram(reviewData.learningProgram())
                    .teacherAndStaff(reviewData.teacherAndStaff())
                    .feedback(reviewData.feedback())
                    .receiveDate(LocalDateTime.now())
                    .status((byte) 0)
                    .build();

            temp = reviewRepository.save(temp);
            return reviewMapper.toReviewVO(temp);
        } else {
            Review temp = reviewRepository.findByReviewId(reviewData.id())
                    .orElseThrow(ReviewNotFoundException::new);
            temp.setFeedback(reviewData.feedback());
            temp.setExtracurricularActivities(reviewData.extracurricularActivities());
            temp.setFacilitiesAndUtilities(reviewData.facilitiesAndUtilities());
            temp.setHygieneAndNutrition(reviewData.hygieneAndNutrition());
            temp.setLearningProgram(reviewData.learningProgram());
            temp.setTeacherAndStaff(reviewData.teacherAndStaff());
            temp.setReceiveDate(LocalDateTime.now());

            temp = reviewRepository.save(temp);
            return reviewMapper.toReviewVO(temp);
        }
    }

    @Override
    public RatingStatVO getReviewStatsBySchool(Integer schoolId) {
        Long totalRatings = reviewRepository.countBySchoolId(schoolId);

        if (totalRatings == null || totalRatings == 0) {
            return new RatingStatVO(0.0, 0, new HashMap<>(), new HashMap<>());
        }

        // Fetch reviews for star range calculation
        List<Review> reviews = reviewRepository.findBySchoolId(schoolId);
        Map<String, Integer> ratingsByStarRange = calculateRatingsByStarRange(reviews);

        // Fetch category averages
        Map<String, Double> categoryRatings = calculateCategoryRatings(schoolId);

        // Fetch overall average
        Double averageRating = reviewRepository.getAverageRatingBySchoolId(schoolId);

        return new RatingStatVO(
                averageRating != null ? averageRating : 0.0,
                totalRatings,
                ratingsByStarRange,
                categoryRatings
        );
    }

    private Map<String, Integer> calculateRatingsByStarRange(List<Review> reviews) {
        Map<String, Integer> ratings = new HashMap<>();
        ratings.put("1", 0);
        ratings.put("2", 0);
        ratings.put("3", 0);
        ratings.put("4", 0);
        ratings.put("5", 0);

        for (Review review : reviews) {
            double avg = (review.getLearningProgram() + review.getFacilitiesAndUtilities() +
                    review.getExtracurricularActivities() + review.getTeacherAndStaff() +
                    review.getHygieneAndNutrition()) / 5.0;

            if (avg == 5.0) ratings.put("5", ratings.get("5") + 1);
            else if (avg >= 4.0) ratings.put("4", ratings.get("4") + 1);
            else if (avg >= 3.0) ratings.put("3", ratings.get("3") + 1);
            else if (avg >= 2.0) ratings.put("2", ratings.get("2") + 1);
            else if (avg >= 1.0) ratings.put("1", ratings.get("1") + 1);
        }

        return ratings;
    }

    private Map<String, Double> calculateCategoryRatings(Integer schoolId) {
        Map<String, Double> categoryRatings = new HashMap<>();

        Double learningProgram = reviewRepository.getAvgLearningProgramBySchoolId(schoolId);
        Double facilities = reviewRepository.getAvgFacilitiesBySchoolId(schoolId);
        Double extracurricular = reviewRepository.getAvgExtracurricularBySchoolId(schoolId);
        Double teachers = reviewRepository.getAvgTeachersBySchoolId(schoolId);
        Double hygiene = reviewRepository.getAvgHygieneBySchoolId(schoolId);

        categoryRatings.put("learningProgram", learningProgram != null ? learningProgram : 0.0);
        categoryRatings.put("facilitiesAndUtilities", facilities != null ? facilities : 0.0);
        categoryRatings.put("extracurricularActivities", extracurricular != null ? extracurricular : 0.0);
        categoryRatings.put("teachersAndStaff", teachers != null ? teachers : 0.0);
        categoryRatings.put("hygieneAndNutrition", hygiene != null ? hygiene : 0.0);

        return categoryRatings;
    }

}