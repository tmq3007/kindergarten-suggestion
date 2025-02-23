package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("auth")
@Tag(name = "Authentication", description = "This API provides user the capability to authentication")

public class AuthController {
        private final AuthService authService;
        private final UserService userService;

        @Operation(summary = "Login", description = "Login")
        @PostMapping("login")
        public ApiResponse<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO, HttpServletResponse response) {
                return ApiResponse.<LoginVO>builder()
                                .code(HttpStatus.OK.value())
                                .message("Login successful")
                                .data(authService.login(loginDTO, response))
                                .build();
        }

        @Operation(summary = "Forgot Password", description = "Forgot Password")
        @PostMapping("forgot-password")
        public ApiResponse<ForgotPasswordVO> forgotpassword(@Valid @RequestBody ForgotPasswordDTO forgotPasswordDTO,
                        HttpServletResponse response) {
                return ApiResponse.<ForgotPasswordVO>builder()
                                .code(HttpStatus.OK.value())
                                .message("Link password reset sent successfully!")
                                .data(authService.forgotpassword(forgotPasswordDTO, response))
                                .build();
        }

        @Operation(summary = "Register", description = "Register")
        @PostMapping("register")
        public ApiResponse<String> register(@Valid @RequestBody RegisterDTO registerDTO, HttpServletResponse response) {
                return ApiResponse.<String>builder()
                                .code(HttpStatus.OK.value())
                                .message("Register successfully!")
                                .data(userService.saveNewUser(registerDTO))
                                .build();
        }

        @GetMapping("/check-email")
        public ApiResponse<String> checkEmail(@RequestParam String email) {
                return ApiResponse.<String>builder()
                                .code(HttpStatus.OK.value())
                                .message("Email available!")
                                .data(authService.checkEmailExists(email))
                                .build();
        }
}
