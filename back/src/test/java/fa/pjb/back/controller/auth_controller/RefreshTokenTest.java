package fa.pjb.back.controller.auth_controller;

import fa.pjb.back.common.exception._12xx_auth.JwtUnauthorizedException;
import fa.pjb.back.controller.AuthController;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.service.AuthService;
import jakarta.servlet.http.Cookie;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RefreshTokenTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    /**
     * ✅ Trường hợp bình thường (Normal Case)
     * Mô tả: Làm mới token thành công với CSRF token và Access token hợp lệ.
     * Kỳ vọng: Trả về HTTP 200 OK, kèm accessToken và csrfToken mới.
     */
    @Test
    void refreshToken_Success() throws Exception {
        LoginVO loginVO = LoginVO.builder()
                .accessToken("newAccessToken")
                .csrfToken("newCsrfToken")
                .build();

        when(authService.refresh(any())).thenReturn(loginVO);

        ResultActions response = mockMvc.perform(put("/auth/refresh-token")
                .header("X-CSRF-TOKEN", "validCsrfToken")
                .cookie(new Cookie("CSRF_TOKEN", "validCsrfToken"))
                .cookie(new Cookie("ACCESS_TOKEN", "validAccessToken"))
                .contentType(MediaType.APPLICATION_JSON));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Login successfully!"))
                .andExpect(jsonPath("$.data.accessToken").value("newAccessToken"))
                .andExpect(jsonPath("$.data.csrfToken").value("newCsrfToken"));
    }

    /**
     * ❌ Trường hợp bất thường (Abnormal Case)
     * Mô tả: CSRF token trong header không khớp với CSRF token trong cookie.
     * Kỳ vọng: Trả về HTTP 401 Unauthorized.
     */
    @Test
    void refreshToken_Fail_CsrfTokenMismatch() throws Exception {
        when(authService.refresh(any())).thenThrow(new JwtUnauthorizedException("Invalid CSRF Token"));

        ResultActions response = mockMvc.perform(put("/auth/refresh-token")
                .header("X-CSRF-TOKEN", "invalidCsrfToken")
                .cookie(new Cookie("CSRF_TOKEN", "validCsrfToken"))
                .cookie(new Cookie("ACCESS_TOKEN", "validAccessToken"))
                .contentType(MediaType.APPLICATION_JSON));

        response.andExpect(status().isUnauthorized());
    }

    /**
     * ⚠️ Trường hợp biên (Boundary Case)
     * Mô tả: CSRF token hợp lệ nhưng Access token rỗng.
     * Kỳ vọng: Trả về HTTP 401 Unauthorized.
     */
    @Test
    void refreshToken_Boundary_EmptyAccessToken() throws Exception {
        when(authService.refresh(any())).thenThrow(new JwtUnauthorizedException("Access token is empty"));

        ResultActions response = mockMvc.perform(put("/auth/refresh-token")
                .header("X-CSRF-TOKEN", "validCsrfToken")
                .cookie(new Cookie("CSRF_TOKEN", "validCsrfToken"))
                .cookie(new Cookie("ACCESS_TOKEN", ""))
                .contentType(MediaType.APPLICATION_JSON));

        response.andExpect(status().isUnauthorized());
    }

    /**
     * ⚠️ Trường hợp cận biên (Near-Boundary Case)
     * Mô tả: CSRF token trong header và cookie khớp nhưng Access token không hợp lệ.
     * Kỳ vọng: Trả về HTTP 401 Unauthorized.
     */
    @Test
    void refreshToken_NearBoundary_InvalidAccessToken() throws Exception {
        when(authService.refresh(any())).thenThrow(new JwtUnauthorizedException("Invalid Access Token"));

        ResultActions response = mockMvc.perform(put("/auth/refresh-token")
                .header("X-CSRF-TOKEN", "validCsrfToken")
                .cookie(new Cookie("CSRF_TOKEN", "validCsrfToken"))
                .cookie(new Cookie("ACCESS_TOKEN", "invalidAccessToken"))
                .contentType(MediaType.APPLICATION_JSON));

        response.andExpect(status().isUnauthorized());
    }

    /**
     * ⚠️ Trường hợp xa biên (Far-Boundary Case)
     * Mô tả: Không có CSRF token trong cookie lẫn header, Access token hợp lệ.
     * Kỳ vọng: Trả về HTTP 401 Unauthorized.
     */
    @Test
    void refreshToken_FarBoundary_MissingCsrfToken() throws Exception {
        when(authService.refresh(any())).thenThrow(new JwtUnauthorizedException("Invalid CSRF Token"));

        ResultActions response = mockMvc.perform(put("/auth/refresh-token")
                .cookie(new Cookie("ACCESS_TOKEN", "validAccessToken"))
                .contentType(MediaType.APPLICATION_JSON));

        response.andExpect(status().isUnauthorized());
    }
}