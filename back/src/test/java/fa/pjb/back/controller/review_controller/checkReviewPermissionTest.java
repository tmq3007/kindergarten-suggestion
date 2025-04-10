package fa.pjb.back.controller.review_controller;

import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.ParentInSchool;
import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.ParentInSchoolRepository;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class checkReviewPermissionTest {

    @Mock
    private ParentInSchoolRepository pisRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private fa.pjb.back.service.impl.ReviewServiceImpl reviewService;

    private Parent parent;
    private School school;
    private User user;

    @BeforeEach
    public void setUp() {
        // Initialize mock objects
        parent = new Parent();
        parent.setId(1);

        school = new School();
        school.setId(1);

        user = new User();
        user.setParent(parent);

        // Mock userService behavior
        when(userService.getCurrentUser()).thenReturn(user);
        // No need to separately mock getParent() since user.setParent(parent) handles it
    }

    @Test
    public void testActivePisNoReview() {
        // Case 1: Active PIS, No Review → "add"
        ParentInSchool pis = new ParentInSchool();
        pis.setParent(parent);
        pis.setSchool(school);
        pis.setStatus((byte) 1);
        pis.setFrom(LocalDate.now().minusDays(10));
        pis.setTo(null);

        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{pis, null});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("add", result);
    }

    @Test
    public void testActivePisWithReview() {
        // Case 2: Active PIS, Has Review → "update"
        ParentInSchool pis = new ParentInSchool();
        pis.setParent(parent);
        pis.setSchool(school);
        pis.setStatus((byte) 1);
        pis.setFrom(LocalDate.now().minusDays(10));
        pis.setTo(null);

        Review review = new Review();
        review.setParent(parent);
        review.setSchool(school);

        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{pis, review});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("update", result);
    }

    @Test
    public void testInactivePisWithin30DaysNoReview() {
        // Case 3: Inactive PIS, to within 30 days, No Review → "add"
        ParentInSchool pis = new ParentInSchool();
        pis.setParent(parent);
        pis.setSchool(school);
        pis.setStatus((byte) 0);
        pis.setFrom(LocalDate.now().minusDays(40));
        pis.setTo(LocalDate.now().minusDays(15));

        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{pis, null});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("add", result);
    }

    @Test
    public void testInactivePisWithin30DaysWithReview() {
        // Case 4: Inactive PIS, to within 30 days, Has Review → "update"
        ParentInSchool pis = new ParentInSchool();
        pis.setParent(parent);
        pis.setSchool(school);
        pis.setStatus((byte) 0);
        pis.setFrom(LocalDate.now().minusDays(40));
        pis.setTo(LocalDate.now().minusDays(15));

        Review review = new Review();
        review.setParent(parent);
        review.setSchool(school);

        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{pis, review});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("update", result);
    }

    @Test
    public void testInactivePisOlderThan30DaysWithReview() {
        // Case 5: Inactive PIS, to older than 30 days, Has Review → "view"
        ParentInSchool pis = new ParentInSchool();
        pis.setParent(parent);
        pis.setSchool(school);
        pis.setStatus((byte) 0);
        pis.setFrom(LocalDate.now().minusDays(60));
        pis.setTo(LocalDate.now().minusDays(45));

        Review review = new Review();
        review.setParent(parent);
        review.setSchool(school);

        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{pis, review});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("view", result);
    }

    @Test
    public void testInactivePisOlderThan30DaysNoReview() {
        // Case 6: Inactive PIS, to older than 30 days, No Review → "hidden"
        ParentInSchool pis = new ParentInSchool();
        pis.setParent(parent);
        pis.setSchool(school);
        pis.setStatus((byte) 0);
        pis.setFrom(LocalDate.now().minusDays(60));
        pis.setTo(LocalDate.now().minusDays(45));

        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{pis, null});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("hidden", result);
    }

    @Test
    public void testNoPisWithReview() {
        // Case 7: No PIS, Has Review → "view"
        Review review = new Review();
        review.setParent(parent);
        review.setSchool(school);

        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{null, review});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("view", result);
    }

    @Test
    public void testNoPisNoReview() {
        // Case 8: No PIS, No Review → "hidden"
        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{null, null});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("hidden", result);
    }

    @Test
    public void testInactivePisWithNullTo() {
        // Edge Case: Inactive PIS with null to → "hidden"
        ParentInSchool pis = new ParentInSchool();
        pis.setParent(parent);
        pis.setSchool(school);
        pis.setStatus((byte) 0);
        pis.setFrom(LocalDate.now().minusDays(60));
        pis.setTo(null);

        Pageable pageable = PageRequest.of(0, 1);
        when(pisRepository.findLatestPisWithReview(1, 1, pageable)).thenReturn(new Object[]{pis, null});

        String result = reviewService.checkReviewPermission(1);
        assertEquals("hidden", result);
    }
}