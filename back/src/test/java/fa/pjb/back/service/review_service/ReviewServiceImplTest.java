package fa.pjb.back.service.review_service;

import fa.pjb.back.common.exception._13xx_school.ReviewNotFoundException;
 import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.mapper.ReviewMapper;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest // khong can @ExtendWith(SpringExtension.class) vi o JUnit 5 co tich hop trong springboot test
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ReviewMapper reviewMapper;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private Review testReview;
    private ReviewVO testReviewVO;
    private School testSchool;
    private Parent testParent;

    @BeforeEach
    void setUp() {
        // Initialize test data
        testSchool = new School();
        testSchool.setId(1);

        testParent = new Parent();
        testParent.setId(1);

        testReview = Review.builder()
                .id(1)
                .school(testSchool)
                .parent(testParent)
                .learningProgram((byte) 5)
                .facilitiesAndUtilities((byte) 4)
                .extracurricularActivities((byte) 5)
                .teacherAndStaff((byte) 4)
                .hygieneAndNutrition((byte) 5)
                .feedback("Great school!")
                .receiveDate(LocalDate.of(2025, 3, 1))
                .build();

        testReviewVO = ReviewVO.builder()
                .id(1)
                .build();
         // Assuming ReviewVO has similar fields, adjust as per actual VO structure
    }

    @Test
    void getAllReview_ByAdmin_success() {
        // Arrange
        Integer schoolId = 1;
        LocalDate fromDate = LocalDate.of(2025, 1, 1);
        LocalDate toDate = LocalDate.of(2025, 3, 1);

        List<Review> reviews = List.of(testReview);
        List<ReviewVO> expectedVOs = List.of(testReviewVO);

        when(reviewRepository.findAllBySchoolIdWithDateRange(schoolId, fromDate, toDate))
                .thenReturn(reviews);
        when(reviewMapper.toReviewVOList(reviews)).thenReturn(expectedVOs);

        // Act
        List<ReviewVO> result = reviewService.getAllReviewByAdmin(schoolId, fromDate, toDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedVOs, result);
    }

    @Test
    void getAllReview_ByAdmin_emptyResult_throwsException() {
        // Arrange
        Integer schoolId = 1;
        LocalDate fromDate = LocalDate.of(2025, 1, 1);
        LocalDate toDate = LocalDate.of(2025, 3, 1);

        when(reviewRepository.findAllBySchoolIdWithDateRange(schoolId, fromDate, toDate))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        assertThrows(ReviewNotFoundException.class, () ->
                reviewService.getAllReviewByAdmin(schoolId, fromDate, toDate));
        verify(reviewRepository).findAllBySchoolIdWithDateRange(schoolId, fromDate, toDate);
        verifyNoInteractions(reviewMapper);
    }

    @Test
    void getTop4RecentFiveStarFeedbacks_success() {
        // Arrange
        List<Review> reviews = List.of(testReview);
        List<ReviewVO> expectedVOs = List.of(testReviewVO);

        when(reviewRepository.getTop4RecentFiveStarFeedbacks(Pageable.ofSize(4))).thenReturn(reviews);
        when(reviewMapper.toReviewVOList(reviews)).thenReturn(expectedVOs);

        // Act
        List<ReviewVO> result = reviewService.getTop4RecentFiveStarFeedbacks();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedVOs, result);
        verify(reviewRepository).getTop4RecentFiveStarFeedbacks(Pageable.ofSize(4));
        verify(reviewMapper).toReviewVOList(reviews);
    }

    @Test
    void getTop4RecentFiveStarFeedbacks_emptyResult_throwsException() {
        // Arrange
        when(reviewRepository.getTop4RecentFiveStarFeedbacks(Pageable.ofSize(4)))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        assertThrows(ReviewNotFoundException.class, () ->
                reviewService.getTop4RecentFiveStarFeedbacks());
        verify(reviewRepository).getTop4RecentFiveStarFeedbacks(Pageable.ofSize(4));
        verifyNoInteractions(reviewMapper);
    }
}