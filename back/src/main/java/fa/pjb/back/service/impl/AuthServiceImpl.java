package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.EmailNotFoundException;
import fa.pjb.back.common.exception.JwtUnauthorizedException;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.ResetPasswordDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.TokenService;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final JwtHelper jwtHelper;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final Dotenv dotenv = Dotenv.load();
    @Value("${access-token-exp}")
    private int ACCESS_TOKEN_EXP;
    @Value("${refresh-token-exp}")
    private int REFRESH_TOKEN_EXP;
    @Value("${csrf-token-exp}")
    private int CSRF_TOKEN_EXP;
    @Value("${forgotpass-token-exp}")
    private int FORGOT_TOKEN_EXP;


    @Override
    public LoginVO login(LoginDTO loginDTO, HttpServletResponse response) {
        // Tạo 1 token gồm username & password dùng để xác thực
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(loginDTO.username(), loginDTO.password());
        // Xác thực token đó bằng AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(usernamePasswordAuthenticationToken);
        // Nếu xác thực thành công thì thêm authentication (người dùng đã xác thực) vào SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Lấy ra UserDetails từ Authentication
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Tạo ra các Token ==========================================================

        // Access Token: Lưu vào Cookie với HttpOnly
        String accessToken = jwtHelper.generateAccessToken(userDetails);
//        tokenService.saveTokenInCookieWithHttpOnly("ACCESS_TOKEN", accessToken, ACCESS_TOKEN_EXP, response);

        // CSRF Token: Lưu vào Cookie không HttpOnly
        String csrfToken = jwtHelper.generateCsrfToken();
//        tokenService.saveTokenInCookie("CSRF_TOKEN", csrfToken, CSRF_TOKEN_EXP, response);

        // Refresh Token: Lưu vào Redis
        String refreshToken = jwtHelper.generateRefreshToken(userDetails);
        tokenService.saveTokenInRedis("REFRESH_TOKEN", userDetails.getUsername(), refreshToken, REFRESH_TOKEN_EXP);

        return LoginVO.builder()
                .accessToken(accessToken)
                .csrfToken(csrfToken)
                .build();
    }

    @Override
    public LoginVO refresh(LoginDTO loginDTO, HttpServletResponse response) {
        return null;
    }

    @Override
    public LoginVO logout(HttpServletResponse response) {
        return null;
    }

    @Override
    public ForgotPasswordVO forgotPassword(ForgotPasswordDTO forgotPasswordDTO, HttpServletResponse response) {
        //Lấy user theo email
        Optional<User> user = userRepository.findByEmail(forgotPasswordDTO.email());
        //Kiểm tra nếu user tồn tại
        if (user.isEmpty()) {
            throw new EmailNotFoundException(forgotPasswordDTO.email());
        }

        //fpToken: Lưu vào Redis
        String fpToken = jwtHelper.generateForgotPasswordToken(user.get().getUsername());
        tokenService.saveTokenInRedis("FORGOTPASS_TOKEN", user.get().getUsername(), fpToken, FORGOT_TOKEN_EXP);

        String resetLink = "http://localhost:3000/forgot-password/reset-password?username=" + user.get().getUsername() + "&token=" + fpToken;
        emailService.sendLinkPasswordResetEmail(forgotPasswordDTO.email(), user.get().getUsername(),resetLink);

        return ForgotPasswordVO.builder()
                .fpToken(fpToken)
                .username(user.get().getUsername())
                .build();
    }

    @Override
    public void resetPassword(ResetPasswordDTO resetPasswordDTO, HttpServletResponse response) {
        //Lấy token từ Redis
        String tokenRedis = tokenService.getTokenFromRedis("FORGOT_PASSWORD_TOKEN", resetPasswordDTO.username());

        //Kiểm tra nếu token không tồn tại hoặc không trùng với token gửi lên
        if(tokenRedis == null || !tokenRedis.equals(resetPasswordDTO.token())){
            throw new JwtUnauthorizedException("Token is invalid");
        }

        //Thay đổi password
        log.info("password{}", resetPasswordDTO.password());

        //Xóa token từ Redis
        tokenService.deleteTokenFromRedis("FORGOT_PASSWORD_TOKEN", resetPasswordDTO.username());
    }

    @Override
    public boolean checkEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}
