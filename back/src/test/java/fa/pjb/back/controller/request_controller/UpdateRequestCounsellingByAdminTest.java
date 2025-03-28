package fa.pjb.back.controller.request_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.controller.RequestCounsellingController;
import fa.pjb.back.model.dto.RequestCounsellingUpdateDTO;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UpdateRequestCounsellingByAdminTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private RequestCounsellingServiceImpl requestCounsellingService;

    @InjectMocks
    private RequestCounsellingController requestCounsellingController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(requestCounsellingController).build();
    }

    /**
     * Test Case 1: Cập nhật request counselling thành công khi request hợp lệ
     * - Mock service xử lý thành công
     * - Kiểm tra response có status 200 OK
     * - Kiểm tra cấu trúc response JSON đúng format
     * - Kiểm tra message trả về đúng
     */
    @Test
    void updateRequestCounselling_WithValidRequest_ShouldReturnSuccess() throws Exception {
        // Arrange
        RequestCounsellingUpdateDTO validRequest = new RequestCounsellingUpdateDTO(1, "Updated response content");

        // Act & Assert
        mockMvc.perform(put("/counselling/update-request-counselling-by-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Update request counselling successfully!"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    /**
     * Test Case 2: Trả về 400 Bad Request khi request thiếu trường bắt buộc
     * - Gửi request không có requestCounsellingId
     * - Kiểm tra response có status 400 Bad Request
     */
    @Test
    void updateRequestCounselling_WithMissingRequiredField_ShouldReturnBadRequest() throws Exception {
        // Arrange
        String invalidRequestJson = "{\"response\":\"Some response\"}"; // Missing requestCounsellingId

        // Act & Assert
        mockMvc.perform(put("/counselling/update-request-counselling-by-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequestJson))
                .andExpect(status().isBadRequest());
    }


    /**
     * Test Case 5: Trả về 404 Not Found khi ID không tồn tại
     * - Mock service ném exception khi ID không tồn tại
     * - Kiểm tra response có status 400 Bad Request
     */
    @Test
    void updateRequestCounselling_WithNonExistentId_ShouldReturnNotFound() throws Exception {
        // Arrange
        RequestCounsellingUpdateDTO validRequest = new RequestCounsellingUpdateDTO(999, "Valid response");

        doThrow(new MissingDataException("Request counselling not found"))
                .when(requestCounsellingService)
                .updateRequestCounsellingByAdmin(any(RequestCounsellingUpdateDTO.class));

        // Act & Assert
        mockMvc.perform(put("/counselling/update-request-counselling-by-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test Case 7: Cập nhật thành công khi response là empty string (nếu cho phép)
     * - Gửi request với response là empty string
     * - Kiểm tra response có status 200 OK
     */
    @Test
    void updateRequestCounselling_WithEmptyResponse_ShouldReturnSuccess() throws Exception {
        // Arrange
        RequestCounsellingUpdateDTO requestWithEmptyResponse = new RequestCounsellingUpdateDTO(1, "");

        // Act & Assert
        mockMvc.perform(put("/counselling/update-request-counselling-by-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestWithEmptyResponse)))
                .andExpect(status().isOk());
    }
}