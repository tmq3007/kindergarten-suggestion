package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.auth.AccessDeniedException;
import fa.pjb.back.common.exception.auth.AuthenticationFailedException;
import fa.pjb.back.common.exception.auth.JwtUnauthorizedException;
import fa.pjb.back.common.exception.email.EmailNotFoundException;
import fa.pjb.back.common.util.HttpRequestHelper;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.ResetPasswordDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.TokenService;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.rmi.server.LogStream;
import java.util.Collection;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final JwtHelper jwtHelper;
    private final HttpRequestHelper httpRequestHelper;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
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
    public LoginVO loginWithCondition(LoginDTO loginDTO, boolean checkAdmin) {
        // Tạo 1 token gồm username & password dùng để xác thực
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(loginDTO.email(), loginDTO.password());
        // Xác thực token đó bằng AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(usernamePasswordAuthenticationToken);
        // Nếu xác thực thành công thì thêm authentication (người dùng đã xác thực) vào SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Lấy ra UserDetails từ Authentication
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        // Nếu checkAdmin = true, kiểm tra quyền của người dùng và từ chối nếu không phải ADMIN
        if (checkAdmin) {
            boolean isAdmin = authorities.stream()
                    .anyMatch(authority -> authority.getAuthority().equals(ERole.ROLE_ADMIN.toString()));
            if (!isAdmin) {
                throw new AccessDeniedException("Access denied");
            }
        }
        // Lấy thông tin người dùng từ cơ sở dữ liệu
        User user = userRepository.findByEmail(loginDTO.email())
                .orElseThrow(() -> new EmailNotFoundException(loginDTO.email()));
        String userId = user.getId().toString();
        String userRole = user.getRole().toString();
        // Tạo ra các Token ==========================================================

        // Access Token: Lưu vào Cookie với HttpOnly
        String accessToken = jwtHelper.generateAccessToken(userDetails, userId, userRole);

        // CSRF Token: Lưu vào Cookie không HttpOnly
        String csrfToken = jwtHelper.generateCsrfToken();

        // Refresh Token: Lưu vào Redis
        String refreshToken = jwtHelper.generateRefreshToken(userDetails, userId, userRole);
        tokenService.saveTokenInRedis("REFRESH_TOKEN", userDetails.getUsername(), refreshToken, REFRESH_TOKEN_EXP);

        return LoginVO.builder()
                .accessToken(accessToken)
                .csrfToken(csrfToken)
                .build();
    }

    @Override
    public LoginVO loginByAdmin(LoginDTO loginDTO) {
        return loginWithCondition(loginDTO, true);
    }

    @Override
    public LoginVO loginByParent(LoginDTO loginDTO) {
        return loginWithCondition(loginDTO, false);
    }

    @Override
    public LoginVO refresh(LoginDTO loginDTO, HttpServletResponse response) {
        return null;
    }

    @Override
    public void logout() {
        Object principal =  SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String username = "";

        if (principal instanceof User user) {
            username = user.getUsername();
        } else {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        // Xóa token từ Redis
        tokenService.deleteTokenFromRedis("REFRESH_TOKEN", username);

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
        tokenService.saveTokenInRedis("FORGOT_PASSWORD_TOKEN", user.get().getUsername(), fpToken, FORGOT_TOKEN_EXP);

        String resetLink = "http://localhost:3000/forgot-password/reset-password?username=" + user.get().getUsername() + "&token=" + fpToken;
        emailService.sendLinkPasswordResetEmail(forgotPasswordDTO.email(), user.get().getUsername(), resetLink);

        return ForgotPasswordVO.builder()
                .fpToken(fpToken)
                .username(user.get().getUsername())
                .build();
    }

    @Override
    public void resetPassword(ResetPasswordDTO resetPasswordDTO, HttpServletRequest request) {

        String forgot_password_token = httpRequestHelper.extractJwtTokenFromCookie(request, "FORGOT_PASSWORD_TOKEN");
        String username = httpRequestHelper.extractJwtTokenFromCookie(request, "FORGOT_PASSWORD_USERNAME");

        //Lấy token từ Redis
        String tokenRedis = tokenService.getTokenFromRedis("FORGOT_PASSWORD_TOKEN", username);

        //Kiểm tra nếu token không tồn tại hoặc không trùng với token gửi lên
        if (tokenRedis == null || !tokenRedis.equals(forgot_password_token)) {
            throw new JwtUnauthorizedException("Token is invalid");
        }

        //Thay đổi password
        User user = userRepository.findByUsername(username).get();

        user.setPassword(passwordEncoder.encode(resetPasswordDTO.password()));

        //Xóa token từ Redis
        tokenService.deleteTokenFromRedis("FORGOT_PASSWORD_TOKEN", username);
    }

    @Override
    public boolean checkEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}
