package fa.pjb.back.service.request_service;

import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.mapper.RequestCounsellingMapper;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.RequestCounsellingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authorization.AuthorizationDeniedException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetRequestCounsellingBySchoolOwnerTest {

    @Mock
    private RequestCounsellingRepository requestCounsellingRepository;

    @Mock
    private RequestCounsellingMapper requestCounsellingMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private RequestCounsellingServiceImpl requestCounsellingService;

    private RequestCounselling mockEntityWithParent;
    private RequestCounselling mockEntityWithoutParent;
    private RequestCounsellingVO mockVOWithAddress;
    private RequestCounsellingVO mockVOWithoutAddress;
    private SchoolOwner currentSchoolOwner;
    private School testSchool;

    @BeforeEach
    void setUp() {
        LocalDateTime testDueDate = LocalDateTime.of(2023, 12, 31, 23, 59);

        // Setup current school owner
        currentSchoolOwner = new SchoolOwner();
        currentSchoolOwner.setId(100);

        // Setup school with Set<SchoolOwner>
        testSchool = new School();
        testSchool.setName("Test School");
        Set<SchoolOwner> schoolOwners = new HashSet<>();
        schoolOwners.add(currentSchoolOwner);
        testSchool.setSchoolOwners(schoolOwners);

        // Setup parent with address
        Parent parent = new Parent();
        parent.setStreet("123 Test Street");
        parent.setWard("Test Ward");
        parent.setDistrict("Test District");
        parent.setProvince("Test Province");

        // Request with parent
        mockEntityWithParent = new RequestCounselling();
        mockEntityWithParent.setId(1);
        mockEntityWithParent.setSchool(testSchool);
        mockEntityWithParent.setInquiry("Test inquiry content");
        mockEntityWithParent.setStatus((byte) 1);
        mockEntityWithParent.setEmail("test@example.com");
        mockEntityWithParent.setPhone("0123456789");
        mockEntityWithParent.setName("Test User");
        mockEntityWithParent.setParent(parent);
        mockEntityWithParent.setDue_date(testDueDate);
        mockEntityWithParent.setResponse("Test response content");

        // Request without parent
        mockEntityWithoutParent = new RequestCounselling();
        mockEntityWithoutParent.setId(2);
        mockEntityWithoutParent.setSchool(testSchool);
        mockEntityWithoutParent.setInquiry("Test inquiry content");
        mockEntityWithoutParent.setStatus((byte) 1);
        mockEntityWithoutParent.setEmail("test@example.com");
        mockEntityWithoutParent.setPhone("0123456789");
        mockEntityWithoutParent.setName("Test User");
        mockEntityWithoutParent.setParent(null); // No parent
        mockEntityWithoutParent.setDue_date(testDueDate);
        mockEntityWithoutParent.setResponse("Test response content");

        // Expected VO with address
        mockVOWithAddress = RequestCounsellingVO.builder()
                .id(1)
                .schoolName("Test School")
                .inquiry("Test inquiry content")
                .status((byte) 1)
                .email("test@example.com")
                .phone("0123456789")
                .name("Test User")
                .address("123 Test Street Test Ward Test District Test Province")
                .dueDate(testDueDate)
                .response("Test response content")
                .build();

        // Expected VO without address
        mockVOWithoutAddress = RequestCounsellingVO.builder()
                .id(2)
                .schoolName("Test School")
                .inquiry("Test inquiry content")
                .status((byte) 1)
                .email("test@example.com")
                .phone("0123456789")
                .name("Test User")
                .address(null)
                .dueDate(testDueDate)
                .response("Test response content")
                .build();
    }

    /**
     * Test Case 1: Successfully get request counselling with parent (full address)
     * - Mock repository returns entity with parent
     * - Mock current school owner
     * - Mock permission check returns true
     * - Mock mapper converts to VO with address
     * - Verify result contains correct address
     */
    @Test
    void getRequestCounselling_WithParentAndPermission_ShouldReturnVOWithAddress() {
        // Arrange
        when(requestCounsellingRepository.findByIdWithParent(1))
                .thenReturn(mockEntityWithParent);
        when(userService.getCurrentSchoolOwner())
                .thenReturn(currentSchoolOwner);
        when(requestCounsellingRepository.isRequestManagedByOwner(1, currentSchoolOwner.getId()))
                .thenReturn(true);
        when(requestCounsellingMapper.toRequestCounsellingVO(mockEntityWithParent))
                .thenReturn(mockVOWithAddress);

        // Act
        RequestCounsellingVO result = requestCounsellingService.getRequestCounsellingBySchoolOwner(1);

        // Assert
        assertNotNull(result);
        assertEquals("Test School", result.schoolName());
        assertEquals("123 Test Street Test Ward Test District Test Province", result.address());
    }

    /**
     * Test Case 2: Request counselling doesn't exist
     * - Mock repository returns null
     * - Verify MissingDataException is thrown
     */
    @Test
    void getRequestCounselling_WhenNotExists_ShouldThrowMissingDataException() {
        // Arrange
        when(requestCounsellingRepository.findByIdWithParent(999))
                .thenReturn(null);

        // Act & Assert
        MissingDataException exception = assertThrows(MissingDataException.class, () -> {
            requestCounsellingService.getRequestCounsellingBySchoolOwner(999);
        });

        assertEquals("Request counselling not found", exception.getMessage());
    }

    /**
     * Test Case 3: School owner doesn't have permission to access the request
     * - Mock repository returns entity
     * - Mock current school owner
     * - Mock permission check returns false
     * - Verify AuthorizationDeniedException is thrown
     */
    @Test
    void getRequestCounselling_WhenNoPermission_ShouldThrowAuthorizationDeniedException() {

        SchoolOwner unauthorizedSchoolOwner = new SchoolOwner();
        unauthorizedSchoolOwner.setId(200);

        // Arrange
        when(requestCounsellingRepository.findByIdWithParent(1))
                .thenReturn(mockEntityWithParent);
        when(userService.getCurrentSchoolOwner())
                .thenReturn(unauthorizedSchoolOwner);
        when(requestCounsellingRepository.isRequestManagedByOwner(1, unauthorizedSchoolOwner.getId()))
                .thenReturn(false);

        // Act & Assert
        AuthorizationDeniedException exception = assertThrows(AuthorizationDeniedException.class, () -> {
            requestCounsellingService.getRequestCounsellingBySchoolOwner(1);
        });

        assertEquals("You don't have permission to manage this request", exception.getMessage());
    }

    /**
     * Test Case 4: Get request counselling without parent (null address)
     * - Mock repository returns entity without parent
     * - Mock current school owner
     * - Mock permission check returns true
     * - Mock mapper converts to VO with null address
     * - Verify result has null address
     */
    @Test
    void getRequestCounselling_WithoutParentAndWithPermission_ShouldReturnVOWithNullAddress() {
        // Arrange
        when(requestCounsellingRepository.findByIdWithParent(2))
                .thenReturn(mockEntityWithoutParent);
        when(userService.getCurrentSchoolOwner())
                .thenReturn(currentSchoolOwner);
        when(requestCounsellingRepository.isRequestManagedByOwner(2, currentSchoolOwner.getId()))
                .thenReturn(true);
        when(requestCounsellingMapper.toRequestCounsellingVO(mockEntityWithoutParent))
                .thenReturn(mockVOWithoutAddress);

        // Act
        RequestCounsellingVO result = requestCounsellingService.getRequestCounsellingBySchoolOwner(2);

        // Assert
        assertNotNull(result);
        assertEquals("Test School", result.schoolName());
        assertNull(result.address());
    }
}