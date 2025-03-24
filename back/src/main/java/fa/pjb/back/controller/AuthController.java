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
@Tag(name = "Authentication Controller", description = "This API provides user the capability to authentication")

public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Login", description = "Login into content website")
    @PostMapping("login/admin")
    public ApiResponse<LoginVO> loginByAdmin(@Valid @RequestBody LoginDTO loginDTO) {
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .data(authService.loginAdmin(loginDTO))
                .build();
    }

    @Operation(summary = "Login", description = "Login into public website")
    @PostMapping("login/public")
    public ApiResponse<LoginVO> loginByParent(@Valid @RequestBody LoginDTO loginDTO) {
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .data(authService.loginPublic(loginDTO))
                .build();
    }

    @Operation(summary = "Forgot password", description = "Send forgot password link to user's email")
    @PostMapping("forgot-password")
    public ApiResponse<ForgotPasswordVO> forgotPassword(@Valid @RequestBody ForgotPasswordDTO forgotPasswordDTO, HttpServletResponse response) {
        return ApiResponse.<ForgotPasswordVO>builder()
                .code(HttpStatus.OK.value())
                .message("Link password reset sent successfully!")
                .data(authService.forgotPassword(forgotPasswordDTO, response))
                .build();
    }

    @Operation(summary = "Reset password", description = "Reset password when user forget password")
    @PostMapping("reset-password")
    public ApiResponse<?> resetPassword(@Valid @RequestBody ResetPasswordDTO resetPasswordDTO,
                                        HttpServletRequest request) {
        authService.resetPassword(resetPasswordDTO, request);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message("Password reset successfully!")
                .build();
    }

    @Operation(summary = "Logout", description = "Logout user from the system")
    @PutMapping("logout")
    public ApiResponse<?> logout() {
        authService.logout();
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message("Logout successfully!")
                .build();
    }

    @Operation(summary = "Check email", description = "Check if the email used for registration is already in use")
    @GetMapping("check-email")
    public ApiResponse<String> checkEmailWhenRegister(@RequestParam String email) {
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Email checked!")
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
