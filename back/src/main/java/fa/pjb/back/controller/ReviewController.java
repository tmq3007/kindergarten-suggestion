package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ReviewAcceptDenyDTO;
import fa.pjb.back.model.dto.ReviewReportDTO;
import fa.pjb.back.model.vo.RatingStatVO;
import fa.pjb.back.model.vo.ReviewReportReminderVO;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("school/review")
@Tag(name = "Review Controller", description = "This API provides some actions relate with Review Action")
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Get reviews by admin", description = "Get review of school in date range")
    @GetMapping("/{schoolId}")
    public ApiResponse<List<ReviewVO>> getReviews(
            @PathVariable Integer schoolId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String status) {

        List<ReviewVO> reviews = reviewService.getAllReviewByAdmin(schoolId, fromDate, toDate, status);
        return ApiResponse.<List<ReviewVO>>builder()
                .code(200)
                .message("Reviews retrieved successfully")
                .data(reviews)
                .build();
    }

    @Operation(summary = "Get reviews list by school public", description = "Get reviews list of school for public school details")
    @GetMapping("/public/{schoolId}")
    public ApiResponse<Page<ReviewVO>> getReviewsPublic(
            @PathVariable Integer schoolId,
            @RequestParam(required = false, defaultValue = "15") Integer size,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false) Integer star) {

        Page<ReviewVO> reviews = reviewService.getReviewListBySchoolForPublic(schoolId, page, size, star);
        return ApiResponse.<Page<ReviewVO>>builder()
                .code(200)
                .message("Reviews retrieved successfully")
                .data(reviews)
                .build();
    }
    @Operation(summary = "Get reviews stats by school public", description = "Get review stats of school for public school details")
    @GetMapping("public/{schoolId}/stats")
    public ApiResponse<RatingStatVO> getReviewStatsBySchool(@PathVariable Integer schoolId) {
        return ApiResponse.<RatingStatVO>builder()
                .code(200)
                .message("Review stats retrieved successfully")
                .data(reviewService.getReviewStatsBySchool(schoolId))
                .build();
    }
    @Operation(summary = "Get reviews by school owner", description = "Get review of school in date range")
    @GetMapping("/")
    public ApiResponse<List<ReviewVO>> getReviewsBySchoolOwner(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String status ) {

        List<ReviewVO> reviews = reviewService.getAllReviewBySchoolOwner( fromDate, toDate,status);
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

    /**
     * @param reviewDTO - The reviewDTO object which contains the review to be reported and the reason of the report
     * @return - The reported review
     */
    @Operation(summary = "Make report", description = "Parents make report to school owner")
    @PutMapping("/report")
    public ApiResponse<ReviewVO> makeReport(@RequestBody @Valid ReviewReportDTO reviewDTO ) {
        // Call the makeReport method of the ReviewService to make the report
        ReviewVO reportReview = reviewService.makeReport(reviewDTO);
        // Return the reported review
        return ApiResponse.<ReviewVO>builder()
                .code(200)
                .message("Reported successfully")
                .data(reportReview)
                .build();
    }

    /**
     * Update the status of the review report
     * @param reviewDTO - The reviewDTO object which contains the review to be updated and the status of the report
     * @return - The updated review
     */
    @Operation(summary = "Update report decision", description = "School owner update report decision")
    @PutMapping("/report/decision")
    public ApiResponse<ReviewVO> reportDecision(@RequestBody @Valid ReviewAcceptDenyDTO reviewDTO ) {
        // Call the acceptReport method of the ReviewService to update the status of the review report
        ReviewVO reportReview = reviewService.acceptReport(reviewDTO);
        // Return the updated review
        return ApiResponse.<ReviewVO>builder()
                .code(200)
                .message("Report decision updated successfully")
                .message("Unreported successfully")
                .data(reportReview)
                .build();
    }

    @Operation(summary = "Get review count", description = "Get review count to show in notification")
    @GetMapping("/count")
    public ApiResponse<List<ReviewReportReminderVO>> getReviewCount() {
        List<ReviewReportReminderVO> count = reviewService.getReviewReportReminders();
        return ApiResponse.<List<ReviewReportReminderVO>>builder()
                .code(200)
                .message("Review count retrieved successfully")
                .data(count)
                .build();
    }

}