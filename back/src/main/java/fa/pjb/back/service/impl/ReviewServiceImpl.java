package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._13xx_school.ReviewNotFoundException;
import fa.pjb.back.mapper.ReviewMapper;
import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.mapper.ReviewMapper;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.service.ReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Override
    public List<ReviewVO> getAllReview(Integer schoolId, LocalDate fromDate, LocalDate toDate) {
        List<Review> reviews = reviewRepository.findAllBySchoolIdWithDateRange(schoolId, fromDate, toDate);
        log.info("reviews: {}", reviews);
        if (reviews.isEmpty()) {
            throw new ReviewNotFoundException();
        }

        log.info("date: {}", reviews.get(0).getReceiveDate().toString());
        return reviewMapper.toReviewVOList(reviews);
    }

    @Override
    public List<ReviewVO> getTop4RecentFiveStarFeedbacks() {
        List<Review> reviews = reviewRepository.getTop4RecentFiveStarFeedbacks();

        if (reviews.isEmpty()) {
            throw new ReviewNotFoundException();
        }
        return reviewMapper.toReviewVOList(reviews);
    }
}