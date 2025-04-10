package fa.pjb.back.controller;

import fa.pjb.back.common.exception._12xx_auth.JwtUnauthorizedException;
import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.ResetPasswordDTO;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
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
    private final JwtHelper jwtHelper;

    private void setAuthCookies(HttpServletResponse response, LoginVO loginVO) {
        long nowInSeconds = System.currentTimeMillis() / 1000;
        long exp = jwtHelper.extractExpirationTimestamp(loginVO.accessToken());
        long ttl = exp - nowInSeconds;

        if (ttl <= 0) {
            throw new JwtUnauthorizedException("Access token is expired");
        }

        int cookieTtl = (int) (ttl + 86400);

        String domain = "kindergartenshop.online";

        // Cookie ACCESS_TOKEN (HttpOnly, Secure, SameSite=None)
        String accessTokenCookie = "ACCESS_TOKEN=" + loginVO.accessToken()
                                   + "; Domain=" + domain
                                   + "; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=" + cookieTtl;

        // Cookie CSRF_TOKEN (Secure, SameSite=None)
        String csrfTokenCookie = "CSRF_TOKEN=" + loginVO.csrfToken()
                                 + "; Domain=" + domain
                                 + "; Secure; SameSite=None; Path=/; Max-Age=" + cookieTtl;

        response.setHeader("Set-Cookie", accessTokenCookie);
        response.addHeader("Set-Cookie", csrfTokenCookie);
    }

    private void setForgotPasswordCookies(HttpServletResponse response, ForgotPasswordVO forgotPasswordVO) {
        long nowInSeconds = System.currentTimeMillis() / 1000;
        long exp = jwtHelper.extractExpirationTimestamp(forgotPasswordVO.fpToken());
        long ttl = exp - nowInSeconds;

        if (ttl <= 0) {
            throw new JwtUnauthorizedException("Access token is expired");
        }

        int cookieTtl = (int) (ttl + 86400);

        String domain = "kindergartenshop.online";

        // Cookie ACCESS_TOKEN (HttpOnly, Secure, SameSite=None)
        String forgotPasswordTokenCookie = "FORGOT_PASSWORD_TOKEN=" + forgotPasswordVO.fpToken()
            + "; Domain=" + domain
            + "; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=" + cookieTtl;

        // Cookie CSRF_TOKEN (Secure, SameSite=None)
        String usernameCookie = "FORGOT_PASSWORD_USERNAME=" + forgotPasswordVO.username()
            + "; Domain=" + domain
            + "; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=" + cookieTtl;

        response.setHeader("Set-Cookie", forgotPasswordTokenCookie);
        response.addHeader("Set-Cookie", usernameCookie);
    }

    @Operation(summary = "Login", description = "Login into content website")
    @PostMapping("login/admin")
    public ApiResponse<LoginVO> loginByAdmin(@Valid @RequestBody LoginDTO loginDTO, HttpServletResponse response) {
        LoginVO loginVO = authService.loginAdmin(loginDTO);
        setAuthCookies(response, loginVO);
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .data(loginVO)
                .build();
    }

    @Operation(summary = "Login", description = "Login into public website")
    @PostMapping("login/public")
    public ApiResponse<LoginVO> loginByParent(@Valid @RequestBody LoginDTO loginDTO, HttpServletResponse response) {
        LoginVO loginVO = authService.loginPublic(loginDTO);
        setAuthCookies(response, loginVO);
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .data(loginVO)
                .build();
    }

    @Operation(summary = "Forgot password", description = "Send forgot password link to user's email")
    @PostMapping("forgot-password")
    public ApiResponse<ForgotPasswordVO> forgotPassword(@Valid @RequestBody ForgotPasswordDTO forgotPasswordDTO, HttpServletResponse response) {
        ForgotPasswordVO forgotPasswordVO = authService.forgotPassword(forgotPasswordDTO, response);
        setForgotPasswordCookies(response, forgotPasswordVO);
        return ApiResponse.<ForgotPasswordVO>builder()
                .code(HttpStatus.OK.value())
                .message("Link password reset sent successfully!")
                .data(forgotPasswordVO)
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
    public ApiResponse<?> logout(HttpServletResponse response) {
        authService.logout(response);
        return ApiResponse.builder()
                .code(HttpStatus.OK.value())
                .message("Logout successfully!")
                .build();
    }

    @Operation(summary = "Check email", description = "Check if the email used for registration is already in use")
    @GetMapping("check-email")
    public ApiResponse<Boolean> checkEmailWhenRegister(@RequestParam String email) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Email checked!")
                .data(authService.checkEmailExists(email))
                .build();
    }

    @PutMapping("refresh-token")
    public ApiResponse<LoginVO> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        LoginVO loginVO = authService.refresh(request);
        setAuthCookies(response, loginVO);
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successfully!")
                .data(loginVO)
                .build();
    }

}
