package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.SchoolNotFoundException;
import fa.pjb.back.mapper.ReviewMapper;
import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.service.ReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public List<ReviewVO> getAllReview(Integer schoolId) {
        List<Review> reviews = reviewRepository.getAllBySchool_Id(schoolId);

        log.info("reviews: {}", reviews);
        if (reviews.isEmpty()) {
            throw new SchoolNotFoundException();
        }

        log.info("date: {}", reviews.get(0).getReceiveDate().toString());
        return reviewMapper.toReviewVOList(reviews);
    }

    @Override
    public List<ReviewVO> getTop4RecentFiveStarFeedbacks() {
        List<Review> reviews = reviewRepository.getTop4RecentFiveStarFeedbacks();

        if (reviews.isEmpty()) {
            throw new SchoolNotFoundException();
        }
        return reviewMapper.toReviewVOList(reviews);
    }
}