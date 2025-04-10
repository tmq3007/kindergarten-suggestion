package fa.pjb.back.service.auth_service;

import fa.pjb.back.common.exception._11xx_email.EmailNotFoundException;
import fa.pjb.back.common.exception._12xx_auth.AccessDeniedException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.util.HttpRequestHelper;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.TokenService;
import fa.pjb.back.service.impl.AuthServiceImpl;
import fa.pjb.back.service.impl.UserDetailsServiceImpl;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class for the login functionality of AuthServiceImpl.
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

    @Mock
    private HttpRequestHelper httpRequestHelper;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @InjectMocks
    private AuthServiceImpl authService;

    private LoginDTO loginDTO;
    private User user;
    private Authentication authentication;

    /**
     * Set up the test environment before each test case.
     */
    @BeforeEach
    void setUp() {
        loginDTO = new LoginDTO("test@example.com", "password");
        user = new User();
        user.setId(1); // Use Integer or Long depending on the actual entity
        user.setEmail("test@example.com");
        user.setUsername("testuser");
        user.setRole(ERole.ROLE_ADMIN);
        user.setPassword("encodedPassword");
    }

    /**
     * Normal Case
     * Description: Successful login with ADMIN role.
     */
    @Test
    void loginWithCondition_Success_Admin() {
        // Arrange
        UserDetails userDetails = user;
        authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

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
        verify(tokenService, times(1)).saveTokenInRedis(eq("REFRESH_TOKEN"), eq("testuser"), eq("refreshToken"), anyInt());
    }

    /**
     * Abnormal Case
     * Description: Login fails because the user does not have ADMIN role.
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
        verify(userRepository, never()).findByEmail(anyString());
        verify(jwtHelper, never()).generateAccessToken(any(), any(), any());
        verify(tokenService, never()).saveTokenInRedis(any(), any(), any(), anyInt());
    }

    /**
     * Abnormal Case
     * Description: Login fails because the email does not exist.
     */
    @Test
    void loginWithCondition_Fail_EmailNotFound() {
        // Arrange
        UserDetails userDetails = user; // Use user directly to avoid ClassCastException
        authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

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
     * Abnormal Case
     * Description: Login fails due to authentication failure (wrong password).
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
     * Boundary Case
     * Description: Login with a user who has a valid email but no authorities.
     */
    @Test
    void loginWithCondition_Boundary_NoAuthorities() {
        // Arrange
        User noAuthoritiesUser = new User();
        noAuthoritiesUser.setId(3);
        noAuthoritiesUser.setUsername("noauthuser");
        noAuthoritiesUser.setEmail("noauth@example.com");
        noAuthoritiesUser.setPassword("encodedPassword");
        noAuthoritiesUser.setRole(ERole.ROLE_PARENT); // Set role to check permissions

        // Use the User object directly as UserDetails
        UserDetails noAuthoritiesUserDetails = noAuthoritiesUser;

        // Mock Authentication
        Authentication noAuthAuthentication = new UsernamePasswordAuthenticationToken(
                noAuthoritiesUserDetails, null, noAuthoritiesUserDetails.getAuthorities()
        );
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(noAuthAuthentication);

        // Act & Assert
        AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> authService.loginWithCondition(loginDTO, true));
        assertEquals("Access denied", exception.getMessage());

        // Verify: Ensure userRepository.findByEmail() is not called
        verify(userRepository, never()).findByEmail(anyString());
    }
}