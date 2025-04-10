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
class GetPresentAcademicHistoryTest {

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

        // Mock parent in school (present)
        parentInSchool = new ParentInSchool();
        parentInSchool.setId(1);
        parentInSchool.setSchool(school);
        parentInSchool.setParent(parent);
        parentInSchool.setFrom(LocalDate.of(2024, 1, 1));
        parentInSchool.setTo(null); // Present: no end date
        parentInSchool.setStatus((byte) 1); // Giả định 1 là "Active"

        // Mock review
        review = new Review();
        review.setLearningProgram((byte)4);
        review.setFacilitiesAndUtilities((byte)4);
        review.setExtracurricularActivities((byte)4);
        review.setTeacherAndStaff((byte)4);
        review.setHygieneAndNutrition((byte)4);
        review.setFeedback("Great school!");

        // Chỉ mock phương thức của UserService
        when(userService.getCurrentUser()).thenReturn(currentUser);
    }

    @Test
    void testGetPresentAcademicHistory_Success() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);

        Object[] result = new Object[]{parentInSchool, school, review};
        Page<Object[]> results = new PageImpl<>(Collections.singletonList(result), pageable, 1);
        when(parentInSchoolRepository.findPresentAcademicHistoryWithReviews(parent.getId(), pageable)).thenReturn(results);

        SchoolSearchVO schoolSearchVO = SchoolSearchVO.builder()
                .id(1)
                .name("School A")
                .build();
        when(schoolMapper.toSchoolSearchVO(school, reviewMapper)).thenReturn(schoolSearchVO);

        List<Object[]> reviewStats = Collections.singletonList(new Object[]{10, 4.2}); // totalReview, avgRating
        when(reviewRepository.getReviewStatisticsBySchoolId(school.getId())).thenReturn(reviewStats);

        // Act
        Page<ParentInSchoolDetailVO> resultPage = service.getPresentAcademicHistory(page, size);

        // Assert
        assertNotNull(resultPage);
        assertEquals(1, resultPage.getTotalElements());
        assertEquals(1, resultPage.getContent().size());

        ParentInSchoolDetailVO vo = resultPage.getContent().get(0);
        assertEquals(1, vo.id());
        assertEquals("School A", vo.school().name());
        assertEquals(LocalDate.of(2024, 1, 1), vo.fromDate());
        assertNull(vo.toDate());
        assertEquals((byte) 1, vo.status());
        assertEquals(10, vo.totalSchoolReview());
        assertEquals(4.2, vo.averageSchoolRating(), 0.01);
        assertEquals(4.0, vo.providedRating(), 0.01); // (4.0 + 4.5 + 4.0 + 4.5 + 4.0) / 5
        assertEquals("Great school!", vo.comment());
        assertTrue(vo.hasEditCommentPermission());

        verify(userService, times(1)).getCurrentUser();
        verify(parentInSchoolRepository, times(1)).findPresentAcademicHistoryWithReviews(parent.getId(), pageable);
        verify(schoolMapper, times(1)).toSchoolSearchVO(school, reviewMapper);
        verify(reviewRepository, times(1)).getReviewStatisticsBySchoolId(school.getId());
    }

    @Test
    void testGetPresentAcademicHistory_EmptyPage() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<Object[]> emptyResults = new PageImpl<>(Collections.emptyList(), pageable, 0);
        when(parentInSchoolRepository.findPresentAcademicHistoryWithReviews(parent.getId(), pageable)).thenReturn(emptyResults);

        // Act
        Page<ParentInSchoolDetailVO> resultPage = service.getPresentAcademicHistory(page, size);

        // Assert
        assertNotNull(resultPage);
        assertEquals(0, resultPage.getTotalElements());
        assertEquals(0, resultPage.getContent().size());

        verify(userService, times(1)).getCurrentUser();
        verify(parentInSchoolRepository, times(1)).findPresentAcademicHistoryWithReviews(parent.getId(), pageable);
        verify(schoolMapper, never()).toSchoolSearchVO(any(), any());
        verify(reviewRepository, never()).getReviewStatisticsBySchoolId(anyInt());
    }

    @Test
    void testGetPresentAcademicHistory_NoReview() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);

        Object[] result = new Object[]{parentInSchool, school, null}; // No review
        Page<Object[]> results = new PageImpl<>(Collections.singletonList(result), pageable, 1);
        when(parentInSchoolRepository.findPresentAcademicHistoryWithReviews(parent.getId(), pageable)).thenReturn(results);

        SchoolSearchVO schoolSearchVO = SchoolSearchVO.builder()
                .id(1)
                .name("School A")
                .build();
        when(schoolMapper.toSchoolSearchVO(school, reviewMapper)).thenReturn(schoolSearchVO);

        List<Object[]> reviewStats = Collections.singletonList(new Object[]{10, 4.2});
        when(reviewRepository.getReviewStatisticsBySchoolId(school.getId())).thenReturn(reviewStats);

        // Act
        Page<ParentInSchoolDetailVO> resultPage = service.getPresentAcademicHistory(page, size);

        // Assert
        assertNotNull(resultPage);
        assertEquals(1, resultPage.getTotalElements());

        ParentInSchoolDetailVO vo = resultPage.getContent().get(0);
        assertEquals(1, vo.id());
        assertNull(vo.providedRating());
        assertNull(vo.comment());
        assertTrue(vo.hasEditCommentPermission());

        verify(userService, times(1)).getCurrentUser();
        verify(parentInSchoolRepository, times(1)).findPresentAcademicHistoryWithReviews(parent.getId(), pageable);
        verify(schoolMapper, times(1)).toSchoolSearchVO(school, reviewMapper);
        verify(reviewRepository, times(1)).getReviewStatisticsBySchoolId(school.getId());
    }
}