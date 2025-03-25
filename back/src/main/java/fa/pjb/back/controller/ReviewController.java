package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("school/review")
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Get reviews", description = "Get review of school in date range")
    @GetMapping("/{schoolId}")
    public ApiResponse<List<ReviewVO>> getReviews(
            @PathVariable  Integer schoolId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        List<ReviewVO> reviews = reviewService.getAllReview(schoolId, fromDate, toDate);
        return ApiResponse.<List<ReviewVO>>builder()
                .code(200)
                .message("Reviews retrieved successfully")
                .data(reviews)
                .build();
    }

    @Operation(summary = "Get top 4 review", description = "Get top 4 review of school which has five star rating recently")
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