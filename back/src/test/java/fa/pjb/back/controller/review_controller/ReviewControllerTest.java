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
import org.mockito.MockitoAnnotations;
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
import static org.mockito.Mockito.lenient;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

     private MockMvc mockMvc;

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(reviewController).build();
    }

    @Test
    void getReviews_NormalCase() throws Exception {
        List<ReviewVO> reviews = Arrays.asList(
                new ReviewVO(1, 100, "School A", 200, "Parent A", "imageA.jpg", (byte) 5, (byte) 4, (byte) 5, (byte) 4, (byte) 5, "Great school", LocalDate.now())
        );

        lenient().when(reviewService.getAllReviewByAdmin(eq(100), any(), any())).thenReturn(reviews);

        mockMvc.perform(get("/school/review/100")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getReviews_AbnormalCase_ReviewNotFound() throws Exception {
        lenient().when(reviewService.getAllReviewByAdmin(eq(999), any(), any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/school/review/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void getReviews_InvalidToDateFormat_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/school/review/1")
                        .param("fromDate", "2024-03-01")
                        .param("toDate", "03-10-2024")
                        .contentType("application/json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getTop4Reviews_NormalCase() throws Exception {
        List<ReviewVO> reviews = Arrays.asList(
                new ReviewVO(1, 100, "School A", 200, "Parent A", "imageA.jpg", (byte) 5, (byte) 4, (byte) 5, (byte) 4, (byte) 5, "Excellent", LocalDate.now()),
                new ReviewVO(2, 101, "School B", 201, "Parent B", "imageB.jpg", (byte) 5, (byte) 5, (byte) 5, (byte) 5, (byte) 5, "Perfect", LocalDate.now())
        );

        lenient().when(reviewService.getTop4RecentFiveStarFeedbacks()).thenReturn(reviews);

        mockMvc.perform(get("/school/review/top4")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }
}