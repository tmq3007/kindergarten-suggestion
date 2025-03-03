package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.ResetPasswordDTO;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

    @Operation(summary = "Login", description = "Login content website")
    @PostMapping("login/admin")
    public ApiResponse<LoginVO> loginByAdmin(@Valid @RequestBody LoginDTO loginDTO) {
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .data(authService.loginByAdmin(loginDTO))
                .build();
    }

    @Operation(summary = "Login", description = "Login public website")
    @PostMapping("login/public")
    public ApiResponse<LoginVO> loginByParent(@Valid @RequestBody LoginDTO loginDTO) {
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .data(authService.loginByParent(loginDTO))
                .build();
    }

    @Operation(summary = "Forgot Password", description = "Forgot Password")
    @PostMapping("forgot-password")
    public ApiResponse<ForgotPasswordVO> forgotPassword(@Valid @RequestBody ForgotPasswordDTO forgotPasswordDTO, HttpServletResponse response) {
        return ApiResponse.<ForgotPasswordVO>builder()
                .code(HttpStatus.OK.value())
                .message("Link password reset sent successfully!")
                .data(authService.forgotPassword(forgotPasswordDTO, response))
                .build();
    }

    @Operation(summary = "Reset Password", description = "Reset Password")
    @PostMapping("reset-password")
    public ApiResponse<?> resetPassword(@Valid @RequestBody ResetPasswordDTO resetPasswordDTO,
                                        HttpServletRequest request) {
        authService.resetPassword(resetPasswordDTO, request);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message("Password reset successfully!")
                .build();
    }

    @Operation(summary = "Logout", description = "Logout")
    @PutMapping("logout")
    public ApiResponse<?> logout() {
        authService.logout();
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message("Logout successfully!")
                .build();
    }

    @GetMapping("check-email")
    public ApiResponse<String> checkEmail(@RequestParam String email) {
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Email available!")
                .data(String.valueOf(authService.checkEmailExists(email)))
                .build();
    }

    @PutMapping("refresh-token")
    public ApiResponse<LoginVO> refreshToken(HttpServletRequest request) {
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successfully!")
                .data(authService.refresh(request))
                .build();
    }
}
