package fa.pjb.back.controller.review_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fa.pjb.back.controller.ReviewController;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(reviewController).build();
    }

    @Test
    void getReviews_NormalCase() throws Exception {
        List<ReviewVO> reviews = Arrays.asList(
                new ReviewVO(1, 100, "School A", 200, "Parent A", "imageA.jpg",
                        (byte) 5, (byte) 4, (byte) 5, (byte) 4, (byte) 5,
                        "Great school", LocalDate.now(), null, (byte) 0)
        );

        when(reviewService.getAllReviewByAdmin(eq(100), any(), any(), any()))
                .thenReturn(reviews);

        mockMvc.perform(get("/school/review/100")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reviews retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].schoolId").value(100))
                .andExpect(jsonPath("$.data[0].feedback").value("Great school"));
    }

    @Test
    void getReviews_WithDateParams() throws Exception {
        List<ReviewVO> reviews = Arrays.asList(
                new ReviewVO(1, 100, "School A", 200, "Parent A", "imageA.jpg",
                        (byte) 5, (byte) 4, (byte) 5, (byte) 4, (byte) 5,
                        "Great school", LocalDate.now(), null, (byte) 0)
        );

        when(reviewService.getAllReviewByAdmin(eq(100),
                eq(LocalDate.parse("2024-01-01")),
                eq(LocalDate.parse("2024-12-31")),
                eq(null)))
                .thenReturn(reviews);

        mockMvc.perform(get("/school/review/100")
                        .param("fromDate", "2024-01-01")
                        .param("toDate", "2024-12-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getReviews_InvalidDateFormat_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/school/review/1")
                        .param("fromDate", "2024-01-01")
                        .param("toDate", "invalid-date")  // Invalid format
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getTop4Reviews_NormalCase() throws Exception {
        List<ReviewVO> reviews = Arrays.asList(
                new ReviewVO(1, 100, "School A", 200, "Parent A", "imageA.jpg",
                        (byte) 5, (byte) 5, (byte) 5, (byte) 5, (byte) 5,
                        "Excellent", LocalDate.now(), null, (byte) 0),
                new ReviewVO(2, 101, "School B", 201, "Parent B", "imageB.jpg",
                        (byte) 5, (byte) 5, (byte) 5, (byte) 5, (byte) 5,
                        "Perfect", LocalDate.now(), null, (byte) 0)
        );

        when(reviewService.getTop4RecentFiveStarFeedbacks()).thenReturn(reviews);

        mockMvc.perform(get("/school/review/top4")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Top 4 reviews retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].learningProgram").value(5));
    }

    @Test
    void getTop4Reviews_EmptyResult() throws Exception {
        when(reviewService.getTop4RecentFiveStarFeedbacks())
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/school/review/top4")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isEmpty());
    }
}