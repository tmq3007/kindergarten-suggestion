package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._13xx_school.ReviewNotFoundException;
import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.mapper.ReviewMapper;
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
    public List<ReviewVO> getAllReviewByAdmin(Integer schoolId, LocalDate fromDate, LocalDate toDate) {
        List<Review> reviews = reviewRepository.findAllBySchoolIdWithDateRange(schoolId, fromDate, toDate);
        log.info("reviews: {}", reviews);
        if (reviews.isEmpty()) {
            throw new ReviewNotFoundException();
        }
        return reviewMapper.toReviewVOList(reviews);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    public List<ReviewVO> getAllReviewBySchoolOwner(LocalDate fromDate, LocalDate toDate){
        SchoolOwner schoolOwner = userService.getCurrentSchoolOwner();
        School school = schoolOwner.getSchool();
        log.info("schoolaaaaaa: {}", school.getId());

        List<Review> reviews = reviewRepository.findAllBySchoolIdWithDateRange(school.getId(), fromDate, toDate);
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

}