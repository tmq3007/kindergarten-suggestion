package fa.pjb.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.common.exception._13xx_school.ReviewNotFoundException;
import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReviewService reviewService;

    private List<ReviewVO> returnReviewVOList;

    @BeforeEach
    void setup() {
        returnReviewVOList = Arrays.asList(
                ReviewVO.builder().id(1).schoolId(1).feedback("Great school!").receiveDate(LocalDate.of(2025, 3, 1)).build(),
                ReviewVO.builder().id(2).schoolId(1).feedback("Excellent!").receiveDate(LocalDate.of(2025, 3, 2)).build(),
                ReviewVO.builder().id(3).schoolId(1).feedback("Awesome!").receiveDate(LocalDate.of(2025, 3, 3)).build(),
                ReviewVO.builder().id(4).schoolId(1).feedback("Fantastic!").receiveDate(LocalDate.of(2025, 3, 4)).build(),
                ReviewVO.builder().id(5).schoolId(2).feedback("Good school!").receiveDate(LocalDate.of(2025, 3, 5)).build()
        );
    }

    /**
     * ✅ Normal Case: Get Reviews with Default Parameters
     */
    @Test
    void testGetReviews_DefaultParameters() throws Exception {
        List<ReviewVO> school1Reviews = returnReviewVOList.stream()
                .filter(review -> review.schoolId() == 1)
                .toList();
        when(reviewService.getAllReview(eq(1), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(school1Reviews);

        mockMvc.perform(get("/api/school/review/1")
                        .param("fromDate", "2025-01-01")
                        .param("toDate", "2025-03-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reviews retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(4))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].feedback").value("Great school!"));
    }

    /**
     * ✅ Normal Case: Filtering by Date Range
     */
    @Test
    void testGetReviews_FilterByDateRange() throws Exception {
        List<ReviewVO> filteredReviews = returnReviewVOList.stream()
                .filter(review -> review.schoolId() == 1 &&
                        !review.receiveDate().isBefore(LocalDate.of(2025, 3, 2)) &&
                        !review.receiveDate().isAfter(LocalDate.of(2025, 3, 3)))
                .toList();
        when(reviewService.getAllReview(eq(1), eq(LocalDate.of(2025, 3, 2)), eq(LocalDate.of(2025, 3, 3))))
                .thenReturn(filteredReviews);

        mockMvc.perform(get("/api/school/review/1")
                        .param("fromDate", "2025-03-02")
                        .param("toDate", "2025-03-03")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reviews retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].id").value(2))
                .andExpect(jsonPath("$.data[1].id").value(3));
    }

    /**
     * ✅ Normal Case: Not Found Result for Get Reviews
     */
    @Test
    void testGetReviews_NotFound() throws Exception {
        when(reviewService.getAllReview(eq(999), any(LocalDate.class), any(LocalDate.class)))
                .thenThrow(new ReviewNotFoundException());

        mockMvc.perform(get("/api/school/review/999")
                        .param("fromDate", "2025-01-01")
                        .param("toDate", "2025-03-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    /**
     * ✅ Normal Case: Get Top 4 Reviews
     */
    @Test
    void testGetTop4Reviews_Default() throws Exception {
        List<ReviewVO> top4Reviews = returnReviewVOList.subList(0, 4);
        when(reviewService.getTop4RecentFiveStarFeedbacks()).thenReturn(top4Reviews);

        mockMvc.perform(get("/api/school/review/top4")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Top 4 reviews retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(4))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[3].id").value(4));
    }

    /**
     * ✅ Normal Case: Not Found Result for Top 4 Reviews
     */
    @Test
    void testGetTop4Reviews_NotFound() throws Exception {
        when(reviewService.getTop4RecentFiveStarFeedbacks()).thenThrow(new ReviewNotFoundException());

        mockMvc.perform(get("/api/school/review/top4")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    /**
     * ❌ Abnormal Case: Invalid School ID
     */
    @Test
    void testGetReviews_InvalidSchoolId() throws Exception {
        mockMvc.perform(get("/api/school/review/invalid")
                        .param("fromDate", "2025-01-01")
                        .param("toDate", "2025-03-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
     }

    /**
     * ❌ Abnormal Case: Invalid Date Format
     */
    @Test
    void testGetReviews_InvalidDateFormat() throws Exception {
        mockMvc.perform(get("/api/school/review/1")
                        .param("fromDate", "invalid-date")
                        .param("toDate", "2025-03-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    /**
     * ❌ Boundary Case: Missing Date Parameters
     */
    @Test
    void testGetReviews_MissingDateParameters() throws Exception {
        List<ReviewVO> school1Reviews = returnReviewVOList.stream()
                .filter(review -> review.schoolId() == 1)
                .toList();
        when(reviewService.getAllReview(eq(1), eq(null), eq(null)))
                .thenReturn(school1Reviews);

        mockMvc.perform(get("/api/school/review/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reviews retrieved successfully"))
                .andExpect(jsonPath("$.data.length()").value(4));
    }


}