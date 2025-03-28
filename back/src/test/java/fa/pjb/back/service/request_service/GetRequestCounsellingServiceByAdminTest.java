package fa.pjb.back.service.request_service;

import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.mapper.RequestCounsellingMapper;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.service.impl.RequestCounsellingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetRequestCounsellingServiceByAdminTest {

    @Mock
    private RequestCounsellingRepository requestCounsellingRepository;

    @Mock
    private RequestCounsellingMapper requestCounsellingMapper;

    @InjectMocks
    private RequestCounsellingServiceImpl requestCounsellingService;

    private RequestCounselling mockEntityWithParent;
    private RequestCounselling mockEntityWithoutParent;
    private RequestCounsellingVO mockVOWithAddress;
    private RequestCounsellingVO mockVOWithoutAddress;

    @BeforeEach
    void setUp() {
        LocalDateTime testDueDate = LocalDateTime.of(2023, 12, 31, 23, 59);

        // Setup school
        School school = new School();
        school.setName("Test School");

        // Setup parent with address
        Parent parent = new Parent();
        parent.setStreet("123 Test Street");
        parent.setWard("Test Ward");
        parent.setDistrict("Test District");
        parent.setProvince("Test Province");

        // Entity with parent
        mockEntityWithParent = new RequestCounselling();
        mockEntityWithParent.setId(1);
        mockEntityWithParent.setSchool(school);
        mockEntityWithParent.setInquiry("Test inquiry content");
        mockEntityWithParent.setStatus((byte) 1);
        mockEntityWithParent.setEmail("test@example.com");
        mockEntityWithParent.setPhone("0123456789");
        mockEntityWithParent.setName("Test User");
        mockEntityWithParent.setParent(parent);
        mockEntityWithParent.setDue_date(testDueDate);
        mockEntityWithParent.setResponse("Test response content");

        // Entity without parent
        mockEntityWithoutParent = new RequestCounselling();
        mockEntityWithoutParent.setId(2);
        mockEntityWithoutParent.setSchool(school);
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
     * Test Case 1: Lấy thông tin request counselling có parent (address đầy đủ)
     * - Mock repository trả về entity có parent
     * - Mock mapper chuyển đổi thành VO với address
     * - Kiểm tra kết quả trả về có address đúng định dạng
     */
    @Test
    void getRequestCounselling_WithParent_ShouldReturnVOWithAddress() {
        // Arrange
        when(requestCounsellingRepository.findByIdWithParent(1))
                .thenReturn(mockEntityWithParent);
        when(requestCounsellingMapper.toRequestCounsellingVO(mockEntityWithParent))
                .thenReturn(mockVOWithAddress);

        // Act
        RequestCounsellingVO result = requestCounsellingService.getRequestCounsellingByAdmin(1);

        // Assert
        assertNotNull(result);
        assertEquals("Test School", result.schoolName());
        assertEquals("123 Test Street Test Ward Test District Test Province", result.address());

        verify(requestCounsellingRepository, times(1)).findByIdWithParent(1);
        verify(requestCounsellingMapper, times(1)).toRequestCounsellingVO(mockEntityWithParent);
    }

    /**
     * Test Case 2: Lấy thông tin request counselling không có parent (address null)
     * - Mock repository trả về entity không có parent
     * - Mock mapper chuyển đổi thành VO với address null
     * - Kiểm tra kết quả trả về có address null
     */
    @Test
    void getRequestCounselling_WithoutParent_ShouldReturnVOWithNullAddress() {
        // Arrange
        when(requestCounsellingRepository.findByIdWithParent(2))
                .thenReturn(mockEntityWithoutParent);
        when(requestCounsellingMapper.toRequestCounsellingVO(mockEntityWithoutParent))
                .thenReturn(mockVOWithoutAddress);

        // Act
        RequestCounsellingVO result = requestCounsellingService.getRequestCounsellingByAdmin(2);

        // Assert
        assertNotNull(result);
        assertEquals("Test School", result.schoolName());
        assertNull(result.address());

        verify(requestCounsellingRepository, times(1)).findByIdWithParent(2);
        verify(requestCounsellingMapper, times(1)).toRequestCounsellingVO(mockEntityWithoutParent);
    }

    /**
     * Test Case 3: Lấy thông tin request counselling không tồn tại
     * - Mock repository trả về null
     * - Kiểm tra ném exception MissingDataException
     */
    @Test
    void getRequestCounselling_WhenNotExists_ShouldThrowMissingDataException() {
        // Arrange
        when(requestCounsellingRepository.findByIdWithParent(999))
                .thenReturn(null);

        // Act & Assert
        MissingDataException exception = assertThrows(MissingDataException.class, () -> {
            requestCounsellingService.getRequestCounsellingByAdmin(999);
        });

        assertEquals("Request counselling not found", exception.getMessage());
        verify(requestCounsellingRepository, times(1)).findByIdWithParent(999);
        verify(requestCounsellingMapper, never()).toRequestCounsellingVO(any());
    }

    /**
     * Test Case 4: Kiểm tra mapper chuyển đổi đúng khi parent có một số trường null
     * - Mock repository trả về entity có parent với một số trường address null
     * - Mock mapper chuyển đổi thành VO với address không bao gồm các trường null
     */
    @Test
    void getRequestCounselling_WithPartialParentAddress_ShouldReturnCorrectAddress() {
        // Arrange
        Parent partialParent = new Parent();
        partialParent.setStreet("123 Test Street");
        partialParent.setWard(null);
        partialParent.setDistrict("Test District");
        partialParent.setProvince(null);

        RequestCounselling entityWithPartialParent = new RequestCounselling();
        entityWithPartialParent.setId(3);
        entityWithPartialParent.setParent(partialParent);
        // Set other fields...

        RequestCounsellingVO expectedVO = RequestCounsellingVO.builder()
                .id(3)
                .address("123 Test Street Test District")
                // Other fields...
                .build();

        when(requestCounsellingRepository.findByIdWithParent(3))
                .thenReturn(entityWithPartialParent);
        when(requestCounsellingMapper.toRequestCounsellingVO(entityWithPartialParent))
                .thenReturn(expectedVO);

        // Act
        RequestCounsellingVO result = requestCounsellingService.getRequestCounsellingByAdmin(3);

        // Assert
        assertNotNull(result);
        assertEquals("123 Test Street Test District", result.address());
    }

    /**
     * Test Case 5: Kiểm tra mapper chuyển đổi school name đúng
     * - Mock repository trả về entity có school
     * - Mock mapper chuyển đổi thành VO với schoolName từ school
     */
    @Test
    void getRequestCounselling_ShouldMapSchoolNameCorrectly() {
        // Arrange
        when(requestCounsellingRepository.findByIdWithParent(1))
                .thenReturn(mockEntityWithParent);
        when(requestCounsellingMapper.toRequestCounsellingVO(mockEntityWithParent))
                .thenReturn(mockVOWithAddress);

        // Act
        RequestCounsellingVO result = requestCounsellingService.getRequestCounsellingByAdmin(1);

        // Assert
        assertEquals("Test School", result.schoolName());
    }
}
