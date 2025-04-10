package fa.pjb.back.service.request_service;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.mapper.RequestCounsellingMapper;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.ParentRequestListVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.RequestCounsellingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetAllRequestsByParentTest {

    @Mock
    private RequestCounsellingRepository requestCounsellingRepository;

    @Mock
    private ParentRepository parentRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private RequestCounsellingMapper requestCounsellingMapper;

    @Mock
    private SchoolMapper schoolMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private UserService userService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RequestCounsellingServiceImpl service;

    private User currentUser;
    private Parent parent;
    private School school;
    private RequestCounselling requestCounselling;

    @BeforeEach
    void setUp() {
        // Mock current user
        currentUser = new User();
        currentUser.setId(1);
        currentUser.setUsername("parentUser");
        currentUser.setFullname("John Doe");
        currentUser.setPhone("1234567890");

        // Mock parent
        parent = new Parent();
        parent.setId(1);
        parent.setUser(currentUser);
        parent.setStreet("123 Main St");
        parent.setWard("Ward 1");
        parent.setDistrict("District 1");
        parent.setProvince("Province 1");

        // Mock school
        school = new School();
        school.setId(1);
        school.setName("School A");

        // Mock request counselling
        requestCounselling = RequestCounselling.builder()
                .id(1)
                .parent(parent)
                .school(school)
                .inquiry("Need more info")
                .status((byte) 0) // Giả định 0 là "Pending"
                .email("parent@example.com")
                .phone("1234567890")
                .name("John Doe")
                .due_date(LocalDateTime.of(2025, 4, 10, 12, 0))
                .response(null)
                .build();

        // Mock SecurityContext
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(currentUser);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testGetAllRequestsByParent_Success() {
        // Arrange
        int page = 1;
        int size = 10;
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<RequestCounselling> requestPage = new PageImpl<>(Collections.singletonList(requestCounselling), pageable, 1);
        when(parentRepository.findParentByUserId(currentUser.getId())).thenReturn(parent);
        when(requestCounsellingRepository.findByParentIdWithSchool(parent.getId(), pageable)).thenReturn(requestPage);

        SchoolDetailVO schoolDetailVO = SchoolDetailVO.builder()
                .id(1)
                .name("School A")
                .build();
        when(schoolMapper.toSchoolDetailVO(school)).thenReturn(schoolDetailVO);

        List<Object[]> reviewStats = Collections.singletonList(new Object[]{10, 4.5}); // totalReview, avgRating
        when(reviewRepository.getReviewStatisticsBySchoolId(school.getId())).thenReturn(reviewStats);

        // Act
        Page<ParentRequestListVO> result = service.getAllRequestsByParent(page, size);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());

        ParentRequestListVO vo = result.getContent().get(0);
        assertEquals(1, vo.id());
        assertEquals("School A", vo.school().name());
        assertEquals("Need more info", vo.inquiry());
        assertEquals((byte) 0, vo.status());
        assertEquals("parent@example.com", vo.email());
        assertEquals("1234567890", vo.phone());
        assertEquals("John Doe", vo.name());
        assertEquals("123 Main St Ward 1 District 1 Province 1", vo.address());
        assertEquals(LocalDateTime.of(2025, 4, 10, 12, 0), vo.dueDate());
        assertNull(vo.response());
        assertEquals(10, vo.totalSchoolReview());
        assertEquals(4.5, vo.averageSchoolRating(), 0.01);

        verify(parentRepository, times(1)).findParentByUserId(currentUser.getId());
        verify(requestCounsellingRepository, times(1)).findByParentIdWithSchool(parent.getId(), pageable);
        verify(schoolMapper, times(1)).toSchoolDetailVO(school);
        verify(reviewRepository, times(1)).getReviewStatisticsBySchoolId(school.getId());
    }

    @Test
    void testGetAllRequestsByParent_EmptyPage() {
        // Arrange
        int page = 1;
        int size = 10;
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<RequestCounselling> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
        when(parentRepository.findParentByUserId(currentUser.getId())).thenReturn(parent);
        when(requestCounsellingRepository.findByParentIdWithSchool(parent.getId(), pageable)).thenReturn(emptyPage);

        // Act
        Page<ParentRequestListVO> result = service.getAllRequestsByParent(page, size);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertEquals(0, result.getContent().size());

        verify(parentRepository, times(1)).findParentByUserId(currentUser.getId());
        verify(requestCounsellingRepository, times(1)).findByParentIdWithSchool(parent.getId(), pageable);
        verify(schoolMapper, never()).toSchoolDetailVO(any());
        verify(reviewRepository, never()).getReviewStatisticsBySchoolId(anyInt());
    }

    @Test
    void testGetAllRequestsByParent_UserNotFound() {
        // Arrange
        int page = 1;
        int size = 10;

        when(parentRepository.findParentByUserId(currentUser.getId())).thenReturn(null);

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> service.getAllRequestsByParent(page, size));

        verify(parentRepository, times(1)).findParentByUserId(currentUser.getId());
        verify(requestCounsellingRepository, never()).findByParentIdWithSchool(anyInt(), any());
    }

    @Test
    void testGetAllRequestsByParent_AuthenticationFailed() {
        // Arrange
        int page = 1;
        int size = 10;

        // Mock SecurityContext trả về principal không phải User
        when(authentication.getPrincipal()).thenReturn("InvalidPrincipal");
        SecurityContextHolder.setContext(securityContext);

        // Act & Assert
        assertThrows(AuthenticationFailedException.class, () -> service.getAllRequestsByParent(page, size));

        verify(parentRepository, never()).findParentByUserId(anyInt());
        verify(requestCounsellingRepository, never()).findByParentIdWithSchool(anyInt(), any());
    }
}
