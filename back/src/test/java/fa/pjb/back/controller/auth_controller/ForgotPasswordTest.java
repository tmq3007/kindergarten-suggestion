package fa.pjb.back.controller.auth_controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.common.exception._11xx_email.EmailNotFoundException;
import fa.pjb.back.controller.AuthController;
import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ForgotPasswordTest {
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * ✅ Trường hợp bình thường (Normal Case)
     * Mô tả: Người dùng nhập một email hợp lệ đã tồn tại trong cơ sở dữ liệu.
     * Kỳ vọng: Trả về HTTP 200 OK kèm fpToken và username.
     */
    @Test
    void forgotPassword_Success() throws Exception {
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("user@example.com")
                .build();

        ForgotPasswordVO forgotPasswordVO = ForgotPasswordVO.builder()
                .fpToken("forgotToken123")
                .username("username123")
                .build();

        when(authService.forgotPassword(any(ForgotPasswordDTO.class), any())).thenReturn(forgotPasswordVO);

        ResultActions response = mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordDTO)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.data.fpToken").value("forgotToken123"))
                .andExpect(jsonPath("$.data.username").value("username123"));
    }

    /**
     * ❌ Trường hợp bất thường (Abnormal Case)
     * Mô tả: Người dùng nhập một email không tồn tại trong cơ sở dữ liệu.
     * Kỳ vọng: Trả về HTTP 404 Not Found.
     */
    @Test
    void forgotPassword_Fail_EmailNotFound() throws Exception {
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("nonexistent@example.com")
                .build();

        when(authService.forgotPassword(any(ForgotPasswordDTO.class), any()))
                .thenThrow(new EmailNotFoundException("nonexistent@example.com"));

        ResultActions response = mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordDTO)));

        response.andExpect(status().isNotFound());
    }

    /**
     * ⚠️ Trường hợp biên (Boundary Case)
     * Mô tả: Email có độ dài tối thiểu hợp lệ.
     * Kỳ vọng: Trả về HTTP 200 OK.
     */
    @Test
    void forgotPassword_Boundary_MinValidEmail() throws Exception {
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("a@b.co")
                .build();

        ForgotPasswordVO forgotPasswordVO = ForgotPasswordVO.builder()
                .fpToken("forgotToken123")
                .username("username123")
                .build();

        when(authService.forgotPassword(any(ForgotPasswordDTO.class), any())).thenReturn(forgotPasswordVO);

        ResultActions response = mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordDTO)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fpToken").value("forgotToken123"))
                .andExpect(jsonPath("$.data.username").value("username123"));
    }

    /**
     * ⚠️ Trường hợp cận biên (Near-Boundary Case)
     * Mô tả: Email dài gần tối đa hợp lệ (< 254 ký tự).
     * Kỳ vọng: Trả về HTTP 200 OK.
     */
    @Test
    void forgotPassword_NearBoundary_LongValidEmail() throws Exception {
        String longEmail = "a_very_long_email_address_1234567890abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz@example.com"; // < 254 chars
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email(longEmail)
                .build();

        ForgotPasswordVO forgotPasswordVO = ForgotPasswordVO.builder()
                .fpToken("forgotToken123")
                .username("username123")
                .build();

        when(authService.forgotPassword(any(ForgotPasswordDTO.class), any())).thenReturn(forgotPasswordVO);

        ResultActions response = mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordDTO)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fpToken").value("forgotToken123"))
                .andExpect(jsonPath("$.data.username").value("username123"));
    }

    /**
     * ⚠️ Trường hợp cận biên (Near-Boundary Case)
     * Mô tả: Email rỗng.
     * Kỳ vọng: Trả về HTTP 400 Bad Request.
     */
    @Test
    void forgotPassword_NearBoundary_EmptyEmail() throws Exception {
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("")
                .build();

        ResultActions response = mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordDTO)));

        response.andExpect(status().isBadRequest());
    }

    /**
     * ⚠️ Trường hợp xa biên (Far-Boundary Case)
     * Mô tả: Email vượt quá độ dài tối đa (> 254 ký tự).
     * Kỳ vọng: Trả về HTTP 400 Bad Request hoặc 404 nếu không tìm thấy.
     */
    @Test
    void forgotPassword_FarBoundary_OverMaxLengthEmail() throws Exception {
        String overMaxEmail = "a_very_long_email_address_1234567890abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz@example.com"; // > 254 chars
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email(overMaxEmail)
                .build();

        when(authService.forgotPassword(any(ForgotPasswordDTO.class), any()))
                .thenThrow(new EmailNotFoundException(overMaxEmail));

        ResultActions response = mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordDTO)));

        response.andExpect(status().isNotFound());
    }

    /**
     * ⚠️ Trường hợp xa biên (Far-Boundary Case)
     * Mô tả: Email chứa ký tự không hợp lệ.
     * Kỳ vọng: Trả về HTTP 400 Bad Request
     */
    @Test
    void forgotPassword_FarBoundary_InvalidCharactersEmail() throws Exception {
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("user><@example.com")
                .build();

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotPasswordDTO)))
                .andExpect(status().isBadRequest());
    }
}
