package fa.pjb.back.service.review_service;

import fa.pjb.back.common.exception._13xx_school.ReviewNotFoundException;
import fa.pjb.back.model.dto.ReviewAcceptDenyDTO;
import fa.pjb.back.model.dto.ReviewReportDTO;
import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.enums.EReviewStatus;
import fa.pjb.back.model.mapper.ReviewMapper;
import fa.pjb.back.model.vo.ReviewReportReminderVO;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ReviewMapper reviewMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private Review testReview;
    private ReviewVO testReviewVO;
    private School testSchool;
    private Parent testParent;
    private SchoolOwner testSchoolOwner;

    @BeforeEach
    void setUp() {
        testSchool = new School();
        testSchool.setId(1);
        testSchool.setName("Test School");

        testParent = new Parent();
        testParent.setId(1);

        testSchoolOwner = new SchoolOwner();
        testSchoolOwner.setSchool(testSchool); // Ensure school is set

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
                .status(EReviewStatus.APPROVED.getValue())
                .receiveDate(LocalDateTime.now())
                .build();

        testReviewVO = ReviewVO.builder()
                .id(1)
                .schoolId(1)
                .schoolName("Test School")
                .parentId(1)
                .learningProgram((byte) 5)
                .facilitiesAndUtilities((byte) 4)
                .extracurricularActivities((byte) 5)
                .teacherAndStaff((byte) 4)
                .hygieneAndNutrition((byte) 5)
                .feedback("Great school!")
                .status(EReviewStatus.APPROVED.getValue())
                .receiveDate(LocalDateTime.now())
                .build();
    }
    // Normal Case
    @Test
    void getAllReviewBySchoolOwner_success() {
        LocalDateTime fromDate = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime toDate = LocalDateTime.now();
        String status = "APPROVED";

        List<Review> reviews = List.of(testReview);
        List<ReviewVO> expectedVOs = List.of(testReviewVO);

        when(userService.getCurrentSchoolOwner()).thenReturn(testSchoolOwner);
        when(reviewRepository.findAllBySchoolIdWithDateRangeSO(testSchool.getId(), (fromDate), (toDate), EReviewStatus.APPROVED.getValue()))
                .thenReturn(reviews);
        when(reviewMapper.toReviewVOList(reviews)).thenReturn(expectedVOs);

        List<ReviewVO> result = reviewService.getAllReviewBySchoolOwner(fromDate, toDate, status);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedVOs, result);
        verify(userService).getCurrentSchoolOwner();
        verify(reviewRepository).findAllBySchoolIdWithDateRangeSO(testSchool.getId(), fromDate, toDate, EReviewStatus.APPROVED.getValue());
        verify(reviewMapper).toReviewVOList(reviews);
    }

    // Abnormal Case - Empty Result
    @Test
    void getAllReviewBySchoolOwner_emptyResult_throwsException() {
        LocalDateTime fromDate = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime toDate = LocalDateTime.now();
        String status = "APPROVED";

        when(userService.getCurrentSchoolOwner()).thenReturn(testSchoolOwner);
        when(reviewRepository.findAllBySchoolIdWithDateRangeSO(testSchool.getId(), fromDate, toDate, EReviewStatus.APPROVED.getValue()))
                .thenReturn(Collections.emptyList());

        assertThrows(ReviewNotFoundException.class, () ->
                reviewService.getAllReviewBySchoolOwner(fromDate, toDate, status));
        verify(userService).getCurrentSchoolOwner();
        verify(reviewRepository).findAllBySchoolIdWithDateRangeSO(testSchool.getId(), fromDate, toDate, EReviewStatus.APPROVED.getValue());
        verifyNoInteractions(reviewMapper);
    }

    // Abnormal Case - Invalid Status
    @Test
    void getAllReviewBySchoolOwner_invalidStatus_throwsException() {
        LocalDateTime fromDate = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime toDate = LocalDateTime.now();
        String status = "INVALID";

        when(userService.getCurrentSchoolOwner()).thenReturn(testSchoolOwner);

        assertThrows(IllegalArgumentException.class, () ->
                reviewService.getAllReviewBySchoolOwner(fromDate, toDate, status));
        verify(userService).getCurrentSchoolOwner();
        verifyNoInteractions(reviewRepository);
        verifyNoInteractions(reviewMapper);
    }

    // Boundary Case - Null Dates
    @Test
    void getAllReviewBySchoolOwner_nullDates_success() {
        LocalDateTime fromDate = null;
        LocalDateTime toDate = null;
        String status = "PENDING";

        List<Review> reviews = List.of(testReview);
        List<ReviewVO> expectedVOs = List.of(testReviewVO);

        when(userService.getCurrentSchoolOwner()).thenReturn(testSchoolOwner);
        when(reviewRepository.findAllBySchoolIdWithDateRangeSO(testSchool.getId(), null, null, EReviewStatus.PENDING.getValue()))
                .thenReturn(reviews);
        when(reviewMapper.toReviewVOList(reviews)).thenReturn(expectedVOs);

        List<ReviewVO> result = reviewService.getAllReviewBySchoolOwner(fromDate, toDate, status);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedVOs, result);
        verify(userService).getCurrentSchoolOwner();
        verify(reviewRepository).findAllBySchoolIdWithDateRangeSO(testSchool.getId(), null, null, EReviewStatus.PENDING.getValue());
        verify(reviewMapper).toReviewVOList(reviews);
    }

    // Boundary Case - Null Status
    @Test
    void getAllReviewBySchoolOwner_nullStatus_success() {
        LocalDateTime fromDate = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime toDate = LocalDateTime.now();
        String status = null;

        List<Review> reviews = List.of(testReview);
        List<ReviewVO> expectedVOs = List.of(testReviewVO);

        when(userService.getCurrentSchoolOwner()).thenReturn(testSchoolOwner);
        when(reviewRepository.findAllBySchoolIdWithDateRangeSO(testSchool.getId(), fromDate, toDate, null))
                .thenReturn(reviews);
        when(reviewMapper.toReviewVOList(reviews)).thenReturn(expectedVOs);

        List<ReviewVO> result = reviewService.getAllReviewBySchoolOwner(fromDate, toDate, status);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedVOs, result);
        verify(userService).getCurrentSchoolOwner();
        verify(reviewRepository).findAllBySchoolIdWithDateRangeSO(testSchool.getId(), fromDate, toDate, null);
        verify(reviewMapper).toReviewVOList(reviews);
    }
    @Test
    void getAllReview_ByAdmin_success() {
        Integer schoolId = 1;
        LocalDateTime fromDate = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime toDate = LocalDateTime.now();

        List<Review> reviews = List.of(testReview);
        List<ReviewVO> expectedVOs = List.of(testReviewVO);

        when(reviewRepository.findAllBySchoolIdWithDateRangeAdmin(schoolId, fromDate, toDate, null))
                .thenReturn(reviews);
        when(reviewMapper.toReviewVOList(reviews)).thenReturn(expectedVOs);

        List<ReviewVO> result = reviewService.getAllReviewByAdmin(schoolId, fromDate, toDate, null);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedVOs, result);
        verify(reviewRepository).findAllBySchoolIdWithDateRangeAdmin(schoolId, fromDate, toDate, null);
        verify(reviewMapper).toReviewVOList(reviews);
    }


    @Test
    void getAllReview_ByAdmin_invalidStatus_throwsException() {
        Integer schoolId = 1;
        LocalDateTime fromDate = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime toDate = LocalDateTime.now();

        assertThrows(IllegalArgumentException.class, () ->
                reviewService.getAllReviewByAdmin(schoolId, fromDate, toDate, "INVALID"));
        verifyNoInteractions(reviewRepository);
        verifyNoInteractions(reviewMapper);
    }

    @Test
    void getTop4RecentFiveStarFeedbacks_success() {
        List<Review> reviews = List.of(testReview);
        List<ReviewVO> expectedVOs = List.of(testReviewVO);

        when(reviewRepository.getTop4RecentFiveStarFeedbacks(Pageable.ofSize(4))).thenReturn(reviews);
        when(reviewMapper.toReviewVOList(reviews)).thenReturn(expectedVOs);

        List<ReviewVO> result = reviewService.getTop4RecentFiveStarFeedbacks();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedVOs, result);
        verify(reviewRepository).getTop4RecentFiveStarFeedbacks(Pageable.ofSize(4));
        verify(reviewMapper).toReviewVOList(reviews);
    }

    @Test
    void getTop4RecentFiveStarFeedbacks_emptyResult_throwsException() {
        when(reviewRepository.getTop4RecentFiveStarFeedbacks(Pageable.ofSize(4)))
                .thenReturn(Collections.emptyList());

        assertThrows(ReviewNotFoundException.class, () ->
                reviewService.getTop4RecentFiveStarFeedbacks());
        verify(reviewRepository).getTop4RecentFiveStarFeedbacks(Pageable.ofSize(4));
        verifyNoInteractions(reviewMapper);
    }

    @Test
    void makeReport_success() {
        ReviewReportDTO reportDTO = new ReviewReportDTO(1, "Inappropriate content");
        ReviewVO updatedReviewVO = ReviewVO.builder()
                .id(1)
                .schoolId(1)
                .schoolName("Test School")
                .report("Inappropriate content")
                .status(EReviewStatus.PENDING.getValue())
                .build();

        when(reviewRepository.findByReviewId(1)).thenReturn(Optional.of(testReview));
        // Stub the mapper to return updatedReviewVO when called with any Review object
        when(reviewMapper.toReviewVO(any(Review.class))).thenReturn(updatedReviewVO);

        ReviewVO result = reviewService.makeReport(reportDTO);

        assertNotNull(result);
        assertEquals("Inappropriate content", result.report());
        assertEquals(EReviewStatus.PENDING.getValue(), result.status());
        verify(reviewRepository).findByReviewId(1);
        verify(reviewMapper).toReviewVO(any(Review.class));
    }

    @Test
    void makeReport_reviewNotFound_throwsException() {
        ReviewReportDTO reportDTO = new ReviewReportDTO(1, "Inappropriate content");

        when(reviewRepository.findByReviewId(1)).thenReturn(Optional.empty());

        assertThrows(ReviewNotFoundException.class, () ->
                reviewService.makeReport(reportDTO));
        verify(reviewRepository).findByReviewId(1);
        verifyNoInteractions(reviewMapper);
    }

    @Test
    void makeReport_notApproved_throwsException() {
        ReviewReportDTO reportDTO = new ReviewReportDTO(1, "Inappropriate content");
        testReview.setStatus(EReviewStatus.PENDING.getValue()); // Not APPROVED

        when(reviewRepository.findByReviewId(1)).thenReturn(Optional.of(testReview));

        assertThrows(IllegalStateException.class, () ->
                reviewService.makeReport(reportDTO));
        verify(reviewRepository).findByReviewId(1);
        verifyNoInteractions(reviewMapper);
    }

    @Test
    void acceptReport_success_approve() {
        ReviewAcceptDenyDTO acceptDTO = new ReviewAcceptDenyDTO(1, true);
        testReview.setStatus(EReviewStatus.PENDING.getValue());
        ReviewVO updatedReviewVO = ReviewVO.builder()
                .id(1)
                .schoolId(1)
                .schoolName("Test School")
                .status(EReviewStatus.REJECTED.getValue())
                .build();

        when(reviewRepository.findByReviewId(1)).thenReturn(Optional.of(testReview));
        when(reviewMapper.toReviewVO(any(Review.class))).thenReturn(updatedReviewVO);

        ReviewVO result = reviewService.acceptReport(acceptDTO);

        assertNotNull(result);
        assertEquals(EReviewStatus.REJECTED.getValue(), result.status());
        verify(reviewRepository).findByReviewId(1);
        verify(reviewMapper).toReviewVO(any(Review.class));
    }

    @Test
    void acceptReport_success_deny() {
        ReviewAcceptDenyDTO denyDTO = new ReviewAcceptDenyDTO(1, false);
        testReview.setStatus(EReviewStatus.PENDING.getValue());
        ReviewVO updatedReviewVO = ReviewVO.builder()
                .id(1)
                .schoolId(1)
                .schoolName("Test School")
                .status(EReviewStatus.APPROVED.getValue())
                .build();

        when(reviewRepository.findByReviewId(1)).thenReturn(Optional.of(testReview));
        when(reviewMapper.toReviewVO(any(Review.class))).thenReturn(updatedReviewVO);

        ReviewVO result = reviewService.acceptReport(denyDTO);

        assertNotNull(result);
        assertEquals(EReviewStatus.APPROVED.getValue(), result.status());
        verify(reviewRepository).findByReviewId(1);
        verify(reviewMapper).toReviewVO(any(Review.class));
    }

    @Test
    void acceptReport_reviewNotFound_throwsException() {
        ReviewAcceptDenyDTO acceptDTO = new ReviewAcceptDenyDTO(1, true);

        when(reviewRepository.findByReviewId(1)).thenReturn(Optional.empty());

        assertThrows(ReviewNotFoundException.class, () ->
                reviewService.acceptReport(acceptDTO));
        verify(reviewRepository).findByReviewId(1);
        verifyNoInteractions(reviewMapper);
    }

    @Test
    void acceptReport_notPending_throwsException() {
        ReviewAcceptDenyDTO acceptDTO = new ReviewAcceptDenyDTO(1, true);
        testReview.setStatus(EReviewStatus.APPROVED.getValue());

        when(reviewRepository.findByReviewId(1)).thenReturn(Optional.of(testReview));

        assertThrows(IllegalStateException.class, () ->
                reviewService.acceptReport(acceptDTO));
        verify(reviewRepository).findByReviewId(1);
        verifyNoInteractions(reviewMapper);
    }

    @Test
    void acceptReport_nullDecision_throwsException() {
        ReviewAcceptDenyDTO acceptDTO = new ReviewAcceptDenyDTO(1, null);
        testReview.setStatus(EReviewStatus.PENDING.getValue());

        when(reviewRepository.findByReviewId(1)).thenReturn(Optional.of(testReview));

        assertThrows(IllegalArgumentException.class, () ->
                reviewService.acceptReport(acceptDTO));
        verify(reviewRepository).findByReviewId(1);
        verifyNoInteractions(reviewMapper);
    }

    @Test
    void getReviewReportReminders_success() {
        School testSchool = new School();
        testSchool.setId(1);
        testSchool.setName("Test School");

        Review pendingReview = Review.builder()
                .id(1)
                .school(testSchool)
                .parent(testParent)
                .status(EReviewStatus.PENDING.getValue())
                .build();

        List<Review> reviews = List.of(pendingReview);
        ReviewReportReminderVO reminderVO = ReviewReportReminderVO.builder()
                .schoolId(1)
                .schoolName("Test School")
                .total(1)
                .build();
        List<ReviewReportReminderVO> expectedReminders = List.of(reminderVO);

        when(reviewRepository.findAllByStatus(EReviewStatus.PENDING.getValue())).thenReturn(reviews);

        List<ReviewReportReminderVO> result = reviewService.getReviewReportReminders();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).total());
        assertEquals("Test School", result.get(0).schoolName());
        assertEquals(1, result.get(0).schoolId());
        verify(reviewRepository).findAllByStatus(EReviewStatus.PENDING.getValue());
    }

    @Test
    void getReviewReportReminders_emptyResult_throwsException() {
        when(reviewRepository.findAllByStatus(EReviewStatus.PENDING.getValue()))
                .thenReturn(Collections.emptyList());

        assertThrows(ReviewNotFoundException.class, () ->
                reviewService.getReviewReportReminders());
        verify(reviewRepository).findAllByStatus(EReviewStatus.PENDING.getValue());
    }
}