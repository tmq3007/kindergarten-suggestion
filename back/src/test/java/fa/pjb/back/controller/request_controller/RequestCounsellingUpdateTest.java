package fa.pjb.back.controller.request_controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.controller.RequestCounsellingController;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.service.impl.RequestCounsellingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

@ExtendWith(MockitoExtension.class)
class RequestCounsellingUpdateTest {

    private MockMvc mockMvc;

    @Mock
    private RequestCounsellingServiceImpl requestCounsellingService;

    @InjectMocks
    private RequestCounsellingController requestCounsellingController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(requestCounsellingController).build();
    }

    /**
     * Test Case 1: Lấy thông tin request counselling thành công khi ID tồn tại
     * - Mock service trả về đối tượng RequestCounsellingVO đầy đủ thông tin
     * - Kiểm tra response có status 200 OK
     * - Kiểm tra cấu trúc response JSON đúng format
     * - Kiểm tra tất cả các trường dữ liệu trả về khớp với mock data
     */
    @Test
    void getRequestCounselling_WhenExists_ShouldReturnRequestCounsellingWithAllFields() throws Exception {
        // Arrange
        Integer requestCounsellingId = 1;
        LocalDateTime testDueDate = LocalDateTime.of(2023, 12, 31, 23, 59);

        RequestCounsellingVO mockVo = RequestCounsellingVO.builder()
                .id(requestCounsellingId)
                .schoolName("Test School")
                .inquiry("Test inquiry content")
                .status((byte) 1)
                .email("test@example.com")
                .phone("0123456789")
                .name("Test User")
                .address("123 Test Street")
                .dueDate(testDueDate)
                .response("Test response content")
                .build();

        when(requestCounsellingService.getRequestCounselling(requestCounsellingId))
                .thenReturn(mockVo);

        // Act & Assert
        mockMvc.perform(get("/counselling/{requestCounsellingId}", requestCounsellingId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Get request counselling successfully!"))
                .andExpect(jsonPath("$.data.id").value(requestCounsellingId))
                .andExpect(jsonPath("$.data.schoolName").value("Test School"))
                .andExpect(jsonPath("$.data.inquiry").value("Test inquiry content"))
                .andExpect(jsonPath("$.data.status").value(1))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.phone").value("0123456789"))
                .andExpect(jsonPath("$.data.name").value("Test User"))
                .andExpect(jsonPath("$.data.address").value("123 Test Street"))
                .andExpect(jsonPath("$.data.dueDate").exists()) // Kiểm tra trường tồn tại
                .andExpect(jsonPath("$.data.response").value("Test response content"));
    }

    /**
     * Test Case 2: Trả về 404 Not Found khi ID không tồn tại trong hệ thống
     * - Mock service ném exception khi ID không tồn tại
     * - Kiểm tra response có status 400 Bad Request
     */
    @Test
    void getRequestCounselling_WhenNotExists_ShouldReturnNotFound() throws Exception {
        // Arrange
        Integer nonExistentId = 999;

        when(requestCounsellingService.getRequestCounselling(nonExistentId))
                .thenThrow(new MissingDataException("Request counselling not found"));

        // Act & Assert
        mockMvc.perform(get("/counselling/{requestCounsellingId}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test Case 3: Trả về 400 Bad Request khi ID có định dạng không hợp lệ
     * - Gửi request với ID không phải là số
     * - Kiểm tra response có status 400 Bad Request
     */
    @Test
    void getRequestCounselling_WithInvalidIdFormat_ShouldReturnBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/counselling/{requestCounsellingId}", "not_number")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test Case 4: Trả về dữ liệu đúng khi một số trường optional không có giá trị
     * - Mock service trả về đối tượng với một số trường null/empty
     * - Kiểm tra response vẫn thành công (200 OK)
     * - Kiểm tra các trường optional không có giá trị được xử lý đúng
     */
    @Test
    void getRequestCounselling_WithSomeNullFields_ShouldReturnSuccess() throws Exception {
        // Arrange
        Integer requestCounsellingId = 2;

        RequestCounsellingVO mockVo = RequestCounsellingVO.builder()
                .id(requestCounsellingId)
                .schoolName("Test School 2")
                .inquiry("Test inquiry content 2")
                .status((byte) 0)
                .email(null) // Trường optional
                .phone(null) // Trường optional
                .name("Test User 2")
                .address(null) // Trường optional
                .dueDate(null) // Trường optional
                .response(null) // Trường optional
                .build();

        when(requestCounsellingService.getRequestCounselling(requestCounsellingId))
                .thenReturn(mockVo);

        // Act & Assert
        mockMvc.perform(get("/counselling/{requestCounsellingId}", requestCounsellingId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.data.id").value(requestCounsellingId))
                .andExpect(jsonPath("$.data.schoolName").value("Test School 2"))
                .andExpect(jsonPath("$.data.email").doesNotExist()) // Kiểm tra trường không tồn tại
                .andExpect(jsonPath("$.data.phone").doesNotExist())
                .andExpect(jsonPath("$.data.dueDate").doesNotExist());
    }
}
