package fa.pjb.back.controller.request_controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.controller.RequestCounsellingController;
import fa.pjb.back.model.vo.ParentRequestListVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.service.RequestCounsellingReminderService;
import fa.pjb.back.service.RequestCounsellingService;
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
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetRequestCounsellingByParent {

    @Mock
    private RequestCounsellingService requestCounsellingService;

    @Mock
    private RequestCounsellingReminderService reminderService;

    @InjectMocks
    private RequestCounsellingController controller;

    private Page<ParentRequestListVO> mockPage;

    @BeforeEach
    void setUp() {
        // Khởi tạo dữ liệu mock cho SchoolDetailVO
        SchoolDetailVO schoolDetailVO = SchoolDetailVO.builder()
                .id(1)
                .name("School A")
                .build();

        // Khởi tạo dữ liệu mock cho ParentRequestListVO
        ParentRequestListVO requestVO = ParentRequestListVO.builder()
                .id(1)
                .school(schoolDetailVO)
                .inquiry("Need more info")
                .status((byte) 0) // Giả định 0 là trạng thái "Pending"
                .email("parent@example.com")
                .phone("1234567890")
                .name("John Doe")
                .address("123 Main St")
                .dueDate(LocalDateTime.of(2025, 4, 10, 12, 0))
                .response(null)
                .totalSchoolReview(5)
                .averageSchoolRating(4.5)
                .build();

        mockPage = new PageImpl<>(Collections.singletonList(requestVO), PageRequest.of(0, 10), 1);
    }

    @Test
    void testGetRequestCounsellingByParent_Success() {
        // Arrange
        int page = 1;
        int size = 10;
        Pageable pageable = PageRequest.of(page - 1, size); // page bắt đầu từ 0 trong Spring Data

        when(requestCounsellingService.getAllRequestsByParent(page, size)).thenReturn(mockPage);

        // Act
        ApiResponse<Page<ParentRequestListVO>> response = controller.getRequestCounsellingByParent(page, size);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Get request counselling successfully!", response.getMessage());
        assertEquals(mockPage, response.getData());
        assertEquals(1, response.getData().getTotalElements());

        ParentRequestListVO resultVO = response.getData().getContent().get(0);
        assertEquals(1, resultVO.id());
        assertEquals("School A", resultVO.school().name());
        assertEquals("Need more info", resultVO.inquiry());
        assertEquals((byte) 0, resultVO.status());
        assertEquals("parent@example.com", resultVO.email());
        assertEquals("1234567890", resultVO.phone());
        assertEquals("John Doe", resultVO.name());
        assertEquals("123 Main St", resultVO.address());
        assertEquals(LocalDateTime.of(2025, 4, 10, 12, 0), resultVO.dueDate());
        assertNull(resultVO.response());
        assertEquals(5, resultVO.totalSchoolReview());
        assertEquals(4.5, resultVO.averageSchoolRating(), 0.01);

        verify(requestCounsellingService, times(1)).getAllRequestsByParent(page, size);
    }

    @Test
    void testGetRequestCounsellingByParent_EmptyPage() {
        // Arrange
        int page = 1;
        int size = 10;
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<ParentRequestListVO> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(requestCounsellingService.getAllRequestsByParent(page, size)).thenReturn(emptyPage);

        // Act
        ApiResponse<Page<ParentRequestListVO>> response = controller.getRequestCounsellingByParent(page, size);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Get request counselling successfully!", response.getMessage());
        assertEquals(emptyPage, response.getData());
        assertEquals(0, response.getData().getTotalElements());

        verify(requestCounsellingService, times(1)).getAllRequestsByParent(page, size);
    }

    @Test
    void testGetRequestCounsellingByParent_DefaultPagination() {
        // Arrange
        int page = 1;
        int size = 10;
        Pageable pageable = PageRequest.of(page - 1, size);

        when(requestCounsellingService.getAllRequestsByParent(page, size)).thenReturn(mockPage);

        // Act
        ApiResponse<Page<ParentRequestListVO>> response = controller.getRequestCounsellingByParent(page, size);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Get request counselling successfully!", response.getMessage());
        assertEquals(mockPage, response.getData());
        assertEquals(1, response.getData().getTotalElements());

        verify(requestCounsellingService, times(1)).getAllRequestsByParent(page, size);
    }

    @Test
    void testGetRequestCounsellingByParent_ServiceThrowsException() {
        // Arrange
        int page = 1;
        int size = 10;

        when(requestCounsellingService.getAllRequestsByParent(page, size))
                .thenThrow(new RuntimeException("Service error"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> controller.getRequestCounsellingByParent(page, size));

        verify(requestCounsellingService, times(1)).getAllRequestsByParent(page, size);
    }
}
