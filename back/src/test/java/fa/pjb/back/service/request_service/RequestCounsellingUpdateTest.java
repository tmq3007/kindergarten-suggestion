package fa.pjb.back.service.request_service;

import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.event.model.CounsellingRequestUpdateEvent;
import fa.pjb.back.model.dto.RequestCounsellingUpdateDTO;
import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.service.impl.RequestCounsellingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestCounsellingUpdateTest {

    @Mock
    private RequestCounsellingRepository requestCounsellingRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RequestCounsellingServiceImpl requestCounsellingService;

    private final Integer EXISTING_REQUEST_ID = 1;
    private final String TEST_RESPONSE = "Test response content";
    private final String TEST_EMAIL = "test@example.com";
    private final String TEST_USERNAME = "testuser";

    @BeforeEach
    void setUp() {
        // Mock security context
        User mockUser = new User();
        mockUser.setUsername(TEST_USERNAME);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    /**
     * Test Case 1: Cập nhật request counselling thành công
     * - Request tồn tại trong hệ thống
     * - Người dùng có quyền (đã được @PreAuthorize kiểm tra)
     * - Kiểm tra trạng thái được cập nhật thành 1
     * - Kiểm tra response được cập nhật đúng
     * - Kiểm tra event được publish
     */
    @Test
    void updateRequestCounselling_WhenRequestExists_ShouldUpdateAndPublishEvent() {
        // Arrange
        RequestCounsellingUpdateDTO updateDTO = new RequestCounsellingUpdateDTO(EXISTING_REQUEST_ID, TEST_RESPONSE);
        RequestCounselling mockRequest = new RequestCounselling();
        mockRequest.setId(EXISTING_REQUEST_ID);
        mockRequest.setEmail(TEST_EMAIL);
        mockRequest.setStatus((byte) 0); // Initial status

        when(requestCounsellingRepository.findById(EXISTING_REQUEST_ID))
                .thenReturn(Optional.of(mockRequest));

        // Act
        requestCounsellingService.updateRequestCounselling(updateDTO);

        // Assert
        verify(requestCounsellingRepository).findById(EXISTING_REQUEST_ID);
        assertEquals((byte) 1, mockRequest.getStatus(), "Status should be updated to 1");
        assertEquals(TEST_RESPONSE, mockRequest.getResponse(), "Response should be updated");

        // Verify event was published with correct parameters
        CounsellingRequestUpdateEvent expectedEvent =
                new CounsellingRequestUpdateEvent(TEST_EMAIL, TEST_USERNAME, TEST_RESPONSE);
        verify(eventPublisher).publishEvent(expectedEvent);
    }

    /**
     * Test Case 2: Không tìm thấy request counselling để cập nhật
     * - Request không tồn tại trong hệ thống
     * - Mong đợi ném ra MissingDataException
     */
    @Test
    void updateRequestCounselling_WhenRequestNotExists_ShouldThrowMissingDataException() {
        // Arrange
        Integer NON_EXISTING_REQUEST_ID = 999;
        RequestCounsellingUpdateDTO updateDTO = new RequestCounsellingUpdateDTO(NON_EXISTING_REQUEST_ID, TEST_RESPONSE);

        when(requestCounsellingRepository.findById(NON_EXISTING_REQUEST_ID))
                .thenReturn(Optional.empty());

        // Act & Assert
        MissingDataException exception = assertThrows(MissingDataException.class,
                () -> requestCounsellingService.updateRequestCounselling(updateDTO));

        assertEquals("Request counselling not found", exception.getMessage());
        verify(requestCounsellingRepository).findById(NON_EXISTING_REQUEST_ID);
        verifyNoInteractions(eventPublisher); // Ensure no event is published
    }

    /**
     * Test Case 3: Cập nhật với response null
     * - Request tồn tại
     * - Response trong DTO là null
     * - Kiểm tra response trong entity được set thành null
     * - Kiểm tra event vẫn được publish với response null
     */
    @Test
    void updateRequestCounselling_WithNullResponse_ShouldUpdateWithNullResponse() {
        // Arrange
        RequestCounsellingUpdateDTO updateDTO = new RequestCounsellingUpdateDTO(EXISTING_REQUEST_ID, null);
        RequestCounselling mockRequest = new RequestCounselling();
        mockRequest.setId(EXISTING_REQUEST_ID);
        mockRequest.setEmail(TEST_EMAIL);
        mockRequest.setStatus((byte) 0);

        when(requestCounsellingRepository.findById(EXISTING_REQUEST_ID))
                .thenReturn(Optional.of(mockRequest));

        // Act
        requestCounsellingService.updateRequestCounselling(updateDTO);

        // Assert
        assertNull(mockRequest.getResponse(), "Response should be null");

        // Verify event was published with null response
        // Verify event was published with correct parameters
        CounsellingRequestUpdateEvent expectedEvent =
                new CounsellingRequestUpdateEvent(TEST_EMAIL, TEST_USERNAME, null);
        verify(eventPublisher).publishEvent(expectedEvent);
    }

    /**
     * Test Case 4: Cập nhật với response rỗng
     * - Request tồn tại
     * - Response trong DTO là chuỗi rỗng
     * - Kiểm tra response trong entity được set thành chuỗi rỗng
     * - Kiểm tra event được publish với response rỗng
     */
    @Test
    void updateRequestCounselling_WithEmptyResponse_ShouldUpdateWithEmptyResponse() {
        // Arrange
        String emptyResponse = "";
        RequestCounsellingUpdateDTO updateDTO = new RequestCounsellingUpdateDTO(EXISTING_REQUEST_ID, emptyResponse);
        RequestCounselling mockRequest = new RequestCounselling();
        mockRequest.setId(EXISTING_REQUEST_ID);
        mockRequest.setEmail(TEST_EMAIL);
        mockRequest.setStatus((byte) 0);

        when(requestCounsellingRepository.findById(EXISTING_REQUEST_ID))
                .thenReturn(Optional.of(mockRequest));

        // Act
        requestCounsellingService.updateRequestCounselling(updateDTO);

        // Assert
        assertEquals(emptyResponse, mockRequest.getResponse(), "Response should be empty string");

        // Verify event was published with correct parameters
        CounsellingRequestUpdateEvent expectedEvent =
                new CounsellingRequestUpdateEvent(TEST_EMAIL, TEST_USERNAME, "");
        verify(eventPublisher).publishEvent(expectedEvent);
    }
}
