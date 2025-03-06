package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("school/review")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{schoolId}")
    public ApiResponse<List<ReviewVO>> getReviewsBySchoolId(@PathVariable Integer schoolId) {
            List<ReviewVO> reviewVO = reviewService.getAllReview(schoolId);
            return ApiResponse.<List<ReviewVO>>builder()
                    .code(200)
                    .message("Reviews retrieved successfully")
                    .data(reviewVO)
                    .build();
    }

    @GetMapping("/top4")
    public ApiResponse<List<ReviewVO>> getTop4Reviews() {
            List<ReviewVO> reviewVO = reviewService.getTop4RecentFiveStarFeedbacks();
            return ApiResponse.<List<ReviewVO>>builder()
                    .code(200)
                    .message("Top 4 reviews retrieved successfully")
                    .data(reviewVO)
                    .build();
    }
}