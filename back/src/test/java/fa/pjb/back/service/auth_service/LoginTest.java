package fa.pjb.back.service.auth_service;

import fa.pjb.back.common.exception._12xx_auth.AccessDeniedException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._11xx_email.EmailNotFoundException;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.TokenService;
import fa.pjb.back.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Lớp kiểm tra chức năng đăng nhập của AuthServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
class LoginTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtHelper jwtHelper;

    @Mock
    private TokenService tokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private LoginDTO loginDTO;
    private User user;
    private UserDetails userDetails;
    private Authentication authentication;

    /**
     * Thiết lập môi trường test trước mỗi test case.
     */
    @BeforeEach
    void setUp() {
        loginDTO = new LoginDTO("test@example.com", "password");
        user = new User();
        user.setId(1); // Sử dụng kiểu Integer hoặc Long tùy theo entity thực tế
        user.setEmail("test@example.com");
        user.setRole(ERole.ROLE_ADMIN);
        user.setPassword("encodedPassword");

        // Tạo UserDetails với quyền ROLE_ADMIN
        userDetails = new org.springframework.security.core.userdetails.User(
                "test@example.com",
                "encodedPassword",
                Collections.singletonList(new SimpleGrantedAuthority(ERole.ROLE_ADMIN.toString()))
        );

        // Mock đối tượng Authentication cho trường hợp xác thực thành công
        authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    /**
     * ✅ Normal Case
     * Mô tả: Đăng nhập thành công với vai trò ADMIN.
     */
    @Test
    void loginWithCondition_Success_Admin() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(userRepository.findByEmail(loginDTO.email())).thenReturn(Optional.of(user));
        when(jwtHelper.generateAccessToken(any(UserDetails.class), anyString(), anyString())).thenReturn("accessToken");
        when(jwtHelper.generateCsrfToken()).thenReturn("csrfToken");
        when(jwtHelper.generateRefreshToken(any(UserDetails.class), anyString(), anyString())).thenReturn("refreshToken");

        // Act
        LoginVO result = authService.loginWithCondition(loginDTO, true);

        // Assert
        assertNotNull(result);
        assertEquals("accessToken", result.accessToken());
        assertEquals("csrfToken", result.csrfToken());
        verify(tokenService, times(1)).saveTokenInRedis(eq("REFRESH_TOKEN"), eq("test@example.com"), eq("refreshToken"), anyInt());
    }

    /**
     * ❌ Abnormal Case
     * Mô tả: Đăng nhập thất bại vì người dùng không có quyền ADMIN.
     */
    @Test
    void loginWithCondition_Fail_NotAdmin() {
        // Arrange
        UserDetails parentUserDetails = new org.springframework.security.core.userdetails.User(
                "test@example.com",
                "encodedPassword",
                Collections.singletonList(new SimpleGrantedAuthority(ERole.ROLE_PARENT.toString()))
        );
        Authentication parentAuthentication = new UsernamePasswordAuthenticationToken(
                parentUserDetails, null, parentUserDetails.getAuthorities()
        );
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(parentAuthentication);

        // Act & Assert
        AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> authService.loginWithCondition(loginDTO, true));
        assertTrue(exception.getMessage().contains("Access denied"));

        // Verify
        verify(jwtHelper, never()).generateAccessToken(any(), any(), any());
        verify(tokenService, never()).saveTokenInRedis(any(), any(), any(), anyInt());
    }

    /**
     * ❌ Abnormal Case
     * Mô tả: Đăng nhập thất bại vì email không tồn tại.
     */
    @Test
    void loginWithCondition_Fail_EmailNotFound() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(userRepository.findByEmail(loginDTO.email())).thenReturn(Optional.empty());

        // Act & Assert
        EmailNotFoundException exception = assertThrows(EmailNotFoundException.class,
                () -> authService.loginWithCondition(loginDTO, false));
        assertEquals("Could not found user with email test@example.com", exception.getMessage());

        // Verify
        verify(jwtHelper, never()).generateAccessToken(any(), any(), any());
        verify(tokenService, never()).saveTokenInRedis(any(), any(), any(), anyInt());
    }

    /**
     * ❌ Abnormal Case
     * Mô tả: Đăng nhập thất bại do xác thực không thành công (mật khẩu sai).
     */
    @Test
    void loginWithCondition_Fail_AuthenticationFailed() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new AuthenticationFailedException("Authentication failed"));

        // Act & Assert
        AuthenticationFailedException exception = assertThrows(AuthenticationFailedException.class,
                () -> authService.loginWithCondition(loginDTO, false));
        assertEquals("Authentication failed", exception.getMessage());

        // Verify
        verify(userRepository, never()).findByEmail(any());
        verify(jwtHelper, never()).generateAccessToken(any(), any(), any());
        verify(tokenService, never()).saveTokenInRedis(any(), any(), any(), anyInt());
    }

    /**
     * ⚠️ Boundary Case
     * Mô tả: Đăng nhập với user có email hợp lệ nhưng không có quyền nào.
     */
    @Test
    void loginWithCondition_Boundary_NoAuthorities() {
        // Arrange
        UserDetails noAuthoritiesUserDetails = new org.springframework.security.core.userdetails.User(
                "test@example.com",
                "encodedPassword",
                Collections.emptyList()
        );
        Authentication noAuthAuthentication = new UsernamePasswordAuthenticationToken(
                noAuthoritiesUserDetails, null, Collections.emptyList()
        );
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(noAuthAuthentication);

        // Act & Assert
        AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> authService.loginWithCondition(loginDTO, true));
        assertEquals("Access denied", exception.getMessage());

        // Verify
        verify(jwtHelper, never()).generateAccessToken(any(), any(), any());
        verify(tokenService, never()).saveTokenInRedis(any(), any(), any(), anyInt());
    }
}