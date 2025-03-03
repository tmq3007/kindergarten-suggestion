package fa.pjb.back.service.auth_service;

import fa.pjb.back.common.exception._12xx_auth.JwtUnauthorizedException;
import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.util.HttpRequestHelper;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.TokenService;
import fa.pjb.back.service.impl.AuthServiceImpl;
import fa.pjb.back.service.impl.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenTest {

    @Mock
    private JwtHelper jwtHelper;

    @Mock
    private HttpRequestHelper httpRequestHelper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private AuthServiceImpl authService;

    private HttpServletRequest request;
    private User user;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        request = mock(HttpServletRequest.class);
        user = new User();
        user.setId(1);
        user.setUsername("testUser");
        user.setEmail("test@example.com");
        user.setRole(ERole.ROLE_ADMIN);

        userDetails = new org.springframework.security.core.userdetails.User(
                "testUser",
                "password",
                java.util.Collections.emptyList()
        );
    }

    @Test
    void refresh_Success() {
        // Arrange
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN")).thenReturn("validCsrfToken");
        when(request.getHeader("X-CSRF-TOKEN")).thenReturn("validCsrfToken");
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN")).thenReturn("validAccessToken");
        when(jwtHelper.extractUsernameIgnoreExpiration("validAccessToken")).thenReturn("testUser");
        when(tokenService.getTokenFromRedis("REFRESH_TOKEN", "testUser")).thenReturn("validRefreshToken");
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
        when(jwtHelper.validateToken("validRefreshToken", userDetails)).thenReturn(true);
        when(jwtHelper.generateAccessToken(any(UserDetails.class), eq("1"), eq("ROLE_ADMIN"))).thenReturn("newAccessToken");
        when(jwtHelper.generateCsrfToken()).thenReturn("newCsrfToken");

        // Act
        LoginVO result = authService.refresh(request);

        // Assert
        assertNotNull(result);
        assertEquals("newAccessToken", result.accessToken());
        assertEquals("newCsrfToken", result.csrfToken());
    }

    @Test
    void refresh_Fail_CsrfTokenMismatch() {
        // Arrange
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN")).thenReturn("csrfFromCookie");
        when(request.getHeader("X-CSRF-TOKEN")).thenReturn("csrfFromHeader");

        // Act & Assert
        JwtUnauthorizedException exception = assertThrows(JwtUnauthorizedException.class,
                () -> authService.refresh(request));
        assertEquals("Invalid CSRF Token", exception.getMessage());
    }

    @Test
    void refresh_Fail_AccessTokenEmpty() {
        // Arrange
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN")).thenReturn("validCsrfToken");
        when(request.getHeader("X-CSRF-TOKEN")).thenReturn("validCsrfToken");
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN")).thenReturn(null);

        // Act & Assert
        JwtUnauthorizedException exception = assertThrows(JwtUnauthorizedException.class,
                () -> authService.refresh(request));
        assertEquals("Access token is empty", exception.getMessage());
    }

    @Test
    void refresh_Fail_InvalidAccessToken() {
        // Arrange
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN")).thenReturn("validCsrfToken");
        when(request.getHeader("X-CSRF-TOKEN")).thenReturn("validCsrfToken");
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN")).thenReturn("invalidAccessToken");
        when(jwtHelper.extractUsernameIgnoreExpiration("invalidAccessToken")).thenReturn(null);

        // Act & Assert
        JwtUnauthorizedException exception = assertThrows(JwtUnauthorizedException.class,
                () -> authService.refresh(request));
        assertEquals("Invalid Access Token", exception.getMessage());
    }

    @Test
    void refresh_Fail_RefreshTokenEmpty() {
        // Arrange
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN")).thenReturn("validCsrfToken");
        when(request.getHeader("X-CSRF-TOKEN")).thenReturn("validCsrfToken");
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN")).thenReturn("validAccessToken");
        when(jwtHelper.extractUsernameIgnoreExpiration("validAccessToken")).thenReturn("testUser");
        when(tokenService.getTokenFromRedis("REFRESH_TOKEN", "testUser")).thenReturn(null);

        // Act & Assert
        JwtUnauthorizedException exception = assertThrows(JwtUnauthorizedException.class,
                () -> authService.refresh(request));
        assertEquals("Refresh token is empty", exception.getMessage());
    }

    @Test
    void refresh_Fail_InvalidRefreshToken() {
        // Arrange
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN")).thenReturn("validCsrfToken");
        when(request.getHeader("X-CSRF-TOKEN")).thenReturn("validCsrfToken");
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN")).thenReturn("validAccessToken");
        when(jwtHelper.extractUsernameIgnoreExpiration("validAccessToken")).thenReturn("testUser");
        when(tokenService.getTokenFromRedis("REFRESH_TOKEN", "testUser")).thenReturn("invalidRefreshToken");
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
        when(jwtHelper.validateToken("invalidRefreshToken", userDetails)).thenReturn(false);

        // Act & Assert
        JwtUnauthorizedException exception = assertThrows(JwtUnauthorizedException.class,
                () -> authService.refresh(request));
        assertEquals("Invalid Refresh Token", exception.getMessage());
    }

    @Test
    void refresh_Fail_UserNotFound() {
        // Arrange
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN")).thenReturn("validCsrfToken");
        when(request.getHeader("X-CSRF-TOKEN")).thenReturn("validCsrfToken");
        when(httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN")).thenReturn("validAccessToken");
        when(jwtHelper.extractUsernameIgnoreExpiration("validAccessToken")).thenReturn("testUser");
        when(tokenService.getTokenFromRedis("REFRESH_TOKEN", "testUser")).thenReturn("validRefreshToken");
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> authService.refresh(request));
    }
}