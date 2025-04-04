package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._11xx_email.EmailNotFoundException;
import fa.pjb.back.common.exception._12xx_auth.AccessDeniedException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._12xx_auth.JwtUnauthorizedException;
import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.common.util.HttpRequestHelper;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.ResetPasswordDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.TokenService;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.Cookie;
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
    private final UserDetailsServiceImpl userDetailsService;
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
    @Value("${forgot-password-token-exp}")
    private int FORGOT_TOKEN_EXP;
    @Value("${reset-password-link-header}")
    private String resetLinkHeader;

    @Override
    public LoginVO loginWithCondition(LoginDTO loginDTO, boolean checkParent) {
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(loginDTO.email(), loginDTO.password());
        // Authenticate the token using AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(usernamePasswordAuthenticationToken);
        // If authentication is successful, add the authentication (authenticated user) to the SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Extract UserDetails from Authentication
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        // If checkParent = true, check the user's role and deny access if they are not ADMIN
        if (checkParent) {
            boolean isParent = authorities.stream()
                    .anyMatch(authority -> authority.getAuthority().equals(ERole.ROLE_PARENT.toString()));
            if (isParent) {
                throw new AccessDeniedException("Access denied");
            }
        }
        // Get user information from database
        User user = userRepository.findByEmail(loginDTO.email())
                .orElseThrow(() -> new EmailNotFoundException(loginDTO.email()));
        String userId = user.getId().toString();
        String userRole = user.getRole().toString();
        // ======================== Create Token =======================
        // Access Token
        String accessToken = jwtHelper.generateAccessToken(userDetails, userId, userRole);
        // CSRF Token
        String csrfToken = jwtHelper.generateCsrfToken();
        // Refresh Token: save to Redis
        String refreshToken = jwtHelper.generateRefreshToken(userDetails, userId, userRole);
        tokenService.saveTokenInRedis("REFRESH_TOKEN", userDetails.getUsername(), refreshToken, REFRESH_TOKEN_EXP);
        User sysUser = (User) userDetails;
        SchoolOwner schoolOwner = sysUser.getSchoolOwner();
        School school = null;
        School draft = null;
        if (schoolOwner != null) {
            school = schoolOwner.getSchool();
            if (school != null) {
                draft = school.getDraft();
            }
        }
        return LoginVO.builder()
                .accessToken(accessToken)
                .csrfToken(csrfToken)
                .hasSchool(school != null)
                .hasDraft(draft != null)
                .build();
    }

    @Override
    public LoginVO loginAdmin(LoginDTO loginDTO) {
        return loginWithCondition(loginDTO, true);
    }

    @Override
    public LoginVO loginPublic(LoginDTO loginDTO) {
        return loginWithCondition(loginDTO, false);
    }

    @Override
    public LoginVO refresh(HttpServletRequest request) throws JwtUnauthorizedException {
        String csrfTokenFromCookie = httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN");
        String csrfTokenFromHeader = request.getHeader("X-CSRF-TOKEN");
        if (csrfTokenFromCookie == null || !csrfTokenFromCookie.equals(csrfTokenFromHeader)) {
            log.info("==================CSRF exception==================");
            throw new JwtUnauthorizedException("Invalid CSRF Token");
        }
        String accessToken = httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN");
        if (accessToken == null || accessToken.isEmpty()) {
            log.info("==================access token err==================");
            throw new JwtUnauthorizedException("Access token is empty");
        }
        log.info("==================access token pass==================");
        String username = jwtHelper.extractUsernameIgnoreExpiration(accessToken);
        if (username == null) {
            throw new JwtUnauthorizedException("Invalid Access Token");
        }
        log.info("username: {}", username);
        String refreshToken = tokenService.getTokenFromRedis("REFRESH_TOKEN", username);
        log.info("refresh token: {}", refreshToken);
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new JwtUnauthorizedException("Refresh token is empty");
        }
        User user = userRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        if (!jwtHelper.validateToken(refreshToken, userDetails)) {
            throw new JwtUnauthorizedException("Invalid Refresh Token");
        }
        String userId = user.getId().toString();
        String userRole = user.getRole().toString();
        // ======================== Create Token =======================
        // Access Token
        String newAccessToken = jwtHelper.generateAccessToken(userDetails, userId, userRole);
        // CSRF Token
        String newCsrfToken = jwtHelper.generateCsrfToken();
        return LoginVO.builder()
                .accessToken(newAccessToken)
                .csrfToken(newCsrfToken)
                .build();
    }

    @Override
    public void logout() {
        // Get principal from SecurityContextHolder
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String username = "";

        log.info("principal: {}", principal);

        // Check if principal is an instance of User entity
        if (principal instanceof User user) {
            username = user.getUsername();
        } else {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        // Remove token from Redis
        tokenService.deleteTokenFromRedis("REFRESH_TOKEN", username);
    }

    @Override
    public ForgotPasswordVO forgotPassword(ForgotPasswordDTO forgotPasswordDTO, HttpServletResponse response) {
        // Get user by email
        Optional<User> user = userRepository.findByEmail(forgotPasswordDTO.email());
        // Check if user exists
        if (user.isEmpty()) {
            throw new EmailNotFoundException(forgotPasswordDTO.email());
        }

        // fpToken: Store into Redis
        String fpToken = jwtHelper.generateForgotPasswordToken(user.get().getUsername());
        tokenService.saveTokenInRedis("FORGOT_PASSWORD_TOKEN", user.get().getUsername(), fpToken, FORGOT_TOKEN_EXP);

        // resetLink: Send resetLink in mail
        String resetLink = resetLinkHeader + "?username=" + user.get().getUsername() + "&token=" + fpToken;
        emailService.sendLinkPasswordResetEmail(forgotPasswordDTO.email(), user.get().getUsername(), resetLink);

        return ForgotPasswordVO.builder()
                .fpToken(fpToken)
                .username(user.get().getUsername())
                .build();
    }

    @Override
    public void resetPassword(ResetPasswordDTO resetPasswordDTO, HttpServletRequest request) {

        // Get forgot_password_token from cookies
        String forgot_password_token = httpRequestHelper.extractJwtTokenFromCookie(request, "FORGOT_PASSWORD_TOKEN");
        //Get username from cookies
        String username = httpRequestHelper.extractJwtTokenFromCookie(request, "FORGOT_PASSWORD_USERNAME");

        // Check if forgot_password_token or username is missing
        if (forgot_password_token == null || username == null) {
            throw new MissingDataException("Forgot Password Token or Username has been missing through communication");
        }

        // Get token from Redis by username
        String tokenRedis = tokenService.getTokenFromRedis("FORGOT_PASSWORD_TOKEN", username);

        // Check if token is not exists or not equals to saved one
        if (tokenRedis == null || !tokenRedis.equals(forgot_password_token)) {
            throw new JwtUnauthorizedException("Token is invalid");
        }

        // Change user's password
        User user = userRepository.findByUsername(username).get();

        user.setPassword(passwordEncoder.encode(resetPasswordDTO.password()));
        userRepository.save(user);

        // Remove token from Redis
        tokenService.deleteTokenFromRedis("FORGOT_PASSWORD_TOKEN", username);
    }

    @Override
    public boolean checkEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

}
