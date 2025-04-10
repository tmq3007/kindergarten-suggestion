package fa.pjb.back.service.parent_service;

import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.ParentInSchool;
import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.mapper.ReviewMapper;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.ParentInSchoolDetailVO;
import fa.pjb.back.model.vo.SchoolSearchVO;
import fa.pjb.back.repository.ParentInSchoolRepository;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.ParentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetPreviousAcademicHistoryTest {

    @Mock
    private UserService userService;

    @Mock
    private ParentInSchoolRepository parentInSchoolRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private SchoolMapper schoolMapper;

    @Mock
    private ReviewMapper reviewMapper;

    @InjectMocks
    private ParentServiceImpl service;

    private User currentUser;
    private Parent parent;
    private School school;
    private ParentInSchool parentInSchool;
    private Review review;

    @BeforeEach
    void setUp() {
        // Khởi tạo current user (không cần mock vì nó là đối tượng thực tế)
        currentUser = new User();
        currentUser.setId(1);

        // Khởi tạo parent
        parent = new Parent();
        parent.setId(1);
        parent.setUser(currentUser);

        // Gán parent vào currentUser (không cần stub vì đây là đối tượng thực tế)
        currentUser.setParent(parent);

        // Mock school
        school = new School();
        school.setId(1);
        school.setName("School A");

        // Mock parent in school (previous)
        parentInSchool = new ParentInSchool();
        parentInSchool.setId(2);
        parentInSchool.setSchool(school);
        parentInSchool.setParent(parent);
        parentInSchool.setFrom(LocalDate.of(2023, 1, 1));
        parentInSchool.setTo(LocalDate.of(2023, 12, 31)); // Previous: has end date
        parentInSchool.setStatus((byte) 0); // Giả định 0 là "Inactive"

        // Mock review
        review = new Review();
        review.setLearningProgram((byte)3);
        review.setFacilitiesAndUtilities((byte)4);
        review.setExtracurricularActivities((byte)3);
        review.setTeacherAndStaff((byte)4);
        review.setHygieneAndNutrition((byte)3);
        review.setFeedback("Good experience");

        // Chỉ mock phương thức của UserService
        when(userService.getCurrentUser()).thenReturn(currentUser);
    }

    @Test
    void testGetPreviousAcademicHistory_Success() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);

        Object[] result = new Object[]{parentInSchool, school, review};
        Page<Object[]> results = new PageImpl<>(Collections.singletonList(result), pageable, 1);
        when(parentInSchoolRepository.findPreviousAcademicHistoryWithReviews(parent.getId(), pageable)).thenReturn(results);

        SchoolSearchVO schoolSearchVO = SchoolSearchVO.builder()
                .id(1)
                .name("School A")
                .build();
        when(schoolMapper.toSchoolSearchVO(school, reviewMapper)).thenReturn(schoolSearchVO);

        List<Object[]> reviewStats = Collections.singletonList(new Object[]{8, 4.0}); // totalReview, avgRating
        when(reviewRepository.getReviewStatisticsBySchoolId(school.getId())).thenReturn(reviewStats);

        // Act
        Page<ParentInSchoolDetailVO> resultPage = service.getPreviousAcademicHistory(page, size);

        // Assert
        assertNotNull(resultPage);
        assertEquals(1, resultPage.getTotalElements());
        assertEquals(1, resultPage.getContent().size());

        ParentInSchoolDetailVO vo = resultPage.getContent().get(0);
        assertEquals(2, vo.id());
        assertEquals("School A", vo.school().name());
        assertEquals(LocalDate.of(2023, 1, 1), vo.fromDate());
        assertEquals(LocalDate.of(2023, 12, 31), vo.toDate());
        assertEquals((byte) 0, vo.status());
        assertEquals(8, vo.totalSchoolReview());
        assertEquals(4.0, vo.averageSchoolRating(), 0.01);
        assertEquals(3.4, vo.providedRating(), 0.01); // (3.5 + 4.0 + 3.5 + 4.0 + 3.5) / 5
        assertEquals("Good experience", vo.comment());
        assertFalse(vo.hasEditCommentPermission()); // > 30 days from now (2025-04-09)

        verify(userService, times(1)).getCurrentUser();
        verify(parentInSchoolRepository, times(1)).findPreviousAcademicHistoryWithReviews(parent.getId(), pageable);
        verify(schoolMapper, times(1)).toSchoolSearchVO(school, reviewMapper);
        verify(reviewRepository, times(1)).getReviewStatisticsBySchoolId(school.getId());
    }

    @Test
    void testGetPreviousAcademicHistory_EmptyPage() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<Object[]> emptyResults = new PageImpl<>(Collections.emptyList(), pageable, 0);
        when(parentInSchoolRepository.findPreviousAcademicHistoryWithReviews(parent.getId(), pageable)).thenReturn(emptyResults);

        // Act
        Page<ParentInSchoolDetailVO> resultPage = service.getPreviousAcademicHistory(page, size);

        // Assert
        assertNotNull(resultPage);
        assertEquals(0, resultPage.getTotalElements());
        assertEquals(0, resultPage.getContent().size());

        verify(userService, times(1)).getCurrentUser();
        verify(parentInSchoolRepository, times(1)).findPreviousAcademicHistoryWithReviews(parent.getId(), pageable);
        verify(schoolMapper, never()).toSchoolSearchVO(any(), any());
        verify(reviewRepository, never()).getReviewStatisticsBySchoolId(anyInt());
    }

    @Test
    void testGetPreviousAcademicHistory_Within30Days() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);

        parentInSchool.setTo(LocalDate.of(2025, 3, 15)); // Within 30 days from 2025-04-09
        Object[] result = new Object[]{parentInSchool, school, review};
        Page<Object[]> results = new PageImpl<>(Collections.singletonList(result), pageable, 1);
        when(parentInSchoolRepository.findPreviousAcademicHistoryWithReviews(parent.getId(), pageable)).thenReturn(results);

        SchoolSearchVO schoolSearchVO = SchoolSearchVO.builder()
                .id(1)
                .name("School A")
                .build();
        when(schoolMapper.toSchoolSearchVO(school, reviewMapper)).thenReturn(schoolSearchVO);

        List<Object[]> reviewStats = Collections.singletonList(new Object[]{8, 4.0});
        when(reviewRepository.getReviewStatisticsBySchoolId(school.getId())).thenReturn(reviewStats);

        // Act
        Page<ParentInSchoolDetailVO> resultPage = service.getPreviousAcademicHistory(page, size);

        // Assert
        assertNotNull(resultPage);
        assertEquals(1, resultPage.getTotalElements());

        ParentInSchoolDetailVO vo = resultPage.getContent().get(0);
        assertEquals(2, vo.id());
        assertTrue(vo.hasEditCommentPermission()); // Within 30 days

        verify(userService, times(1)).getCurrentUser();
        verify(parentInSchoolRepository, times(1)).findPreviousAcademicHistoryWithReviews(parent.getId(), pageable);
        verify(schoolMapper, times(1)).toSchoolSearchVO(school, reviewMapper);
        verify(reviewRepository, times(1)).getReviewStatisticsBySchoolId(school.getId());
    }
}