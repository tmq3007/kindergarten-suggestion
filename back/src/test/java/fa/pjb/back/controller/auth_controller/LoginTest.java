package fa.pjb.back.controller.auth_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.controller.AuthController;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.vo.LoginVO;
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
class LoginTest {

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
     * Normal Case
     * Description: Successful login with valid email and password.
     * Expected: Returns HTTP 200 OK with accessToken and csrfToken.
     */
    @Test
    void loginByAdmin_Success() throws Exception {
        LoginDTO loginDTO = LoginDTO.builder()
                .email("test@gmail.com")
                .password("test1234")
                .build();

        LoginVO loginVO = LoginVO.builder()
                .accessToken("accessToken")
                .csrfToken("csrfToken")
                .build();

        when(authService.loginAdmin(any(LoginDTO.class))).thenReturn(loginVO);

        ResultActions response = mockMvc.perform(post("/auth/login/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.data.accessToken").value("accessToken"))
                .andExpect(jsonPath("$.data.csrfToken").value("csrfToken"));
    }

    /**
     * Abnormal Case
     * Description: Login fails when email is empty.
     * Expected: Returns HTTP 400 Bad Request.
     */
    @Test
    void loginByAdmin_Fail_EmptyEmail() throws Exception {
        LoginDTO loginDTO = LoginDTO.builder()
                .email("")
                .password("test1234")
                .build();

        ResultActions response = mockMvc.perform(post("/auth/login/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        response.andExpect(status().isBadRequest());
    }

    /**
     * Boundary Case
     * Description: Login with the shortest valid email and a password of exactly 7 characters.
     * Expected: Returns HTTP 200 OK.
     */
    @Test
    void loginByAdmin_Boundary_MinValidEmailAndPassword() throws Exception {
        LoginDTO loginDTO = LoginDTO.builder()
                .email("a@b.co")
                .password("pass123")
                .build();

        LoginVO loginVO = LoginVO.builder()
                .accessToken("accessToken")
                .csrfToken("csrfToken")
                .build();

        when(authService.loginAdmin(any(LoginDTO.class))).thenReturn(loginVO);

        ResultActions response = mockMvc.perform(post("/auth/login/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("accessToken"))
                .andExpect(jsonPath("$.data.csrfToken").value("csrfToken"));
    }

    /**
     * Near-Boundary Case
     * Description: Login with an email missing the domain extension and a password shorter than 7 characters.
     * Expected: Returns HTTP 400 Bad Request.
     */
    @Test
    void loginByAdmin_NearBoundary_InvalidEmailAndShortPassword() throws Exception {
        LoginDTO loginDTO = LoginDTO.builder()
                .email("a@b")
                .password("pass12")
                .build();

        ResultActions response = mockMvc.perform(post("/auth/login/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        response.andExpect(status().isBadRequest());
    }

    /**
     * Far-Boundary Case
     * Description: Login with an invalid email (only one character) and a very short password.
     * Expected: Returns HTTP 400 Bad Request.
     */
    @Test
    void loginByAdmin_FarBoundary_VeryShortEmailAndPassword() throws Exception {
        LoginDTO loginDTO = LoginDTO.builder()
                .email("a")
                .password("a")
                .build();

        ResultActions response = mockMvc.perform(post("/auth/login/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        response.andExpect(status().isBadRequest());
    }

    /**
     * Far-Boundary Case
     * Description: Login with a very long but valid email and a very long password.
     * Expected: Returns HTTP 200 OK.
     */
    @Test
    void loginByAdmin_FarBoundary_VeryLongEmailAndPassword() throws Exception {
        String longEmail = "veryverylongemail@domain.com";
        String longPassword = "password1234567890123456789012345678901234567890";

        LoginDTO loginDTO = LoginDTO.builder()
                .email(longEmail)
                .password(longPassword)
                .build();

        LoginVO loginVO = LoginVO.builder()
                .accessToken("accessToken")
                .csrfToken("csrfToken")
                .build();

        when(authService.loginAdmin(any(LoginDTO.class))).thenReturn(loginVO);

        ResultActions response = mockMvc.perform(post("/auth/login/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("accessToken"))
                .andExpect(jsonPath("$.data.csrfToken").value("csrfToken"));
    }
}