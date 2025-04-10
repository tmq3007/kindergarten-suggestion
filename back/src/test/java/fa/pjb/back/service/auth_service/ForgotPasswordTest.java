package fa.pjb.back.service.auth_service;

import fa.pjb.back.common.exception._11xx_email.EmailNotFoundException;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.TokenService;
import fa.pjb.back.service.impl.AuthServiceImpl;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ForgotPasswordTest {

    @InjectMocks
    private AuthServiceImpl authService; // Giả định lớp triển khai là AuthServiceImpl

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private TokenService tokenService;

    @Mock
    private JwtHelper jwtHelper;

    @Mock
    private HttpServletResponse response;

    @Mock
    private ForgotPasswordVO forgotPasswordVO;

    @BeforeEach
    void setUp() {
        // Không cần cấu hình thêm cho response trong trường hợp này
    }

    // 1. Normal Test Case
    @Test
    public void forgotPassword_Success() throws MessagingException {
        // Arrange

        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("user@example.com")
                .build();
        User user = new User(); // Giả định User có getter cho username
        user.setUsername("username123");
        user.setEmail("user@example.com");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(emailService.sendLinkPasswordResetEmail("user@example.com", "username123", "null?username=username123&token=token123"))
                .thenReturn("Link password reset sent successfully!");
        when(jwtHelper.generateForgotPasswordToken("username123")).thenReturn("token123");

        // Act
        ForgotPasswordVO result = authService.forgotPassword(forgotPasswordDTO, response);

        // Assert
        assertNotNull(result);
        assertEquals("token123", result.fpToken());
        assertEquals("username123", result.username());
        verify(userRepository, times(1)).findByEmail("user@example.com");
        verify(emailService, times(1)).sendLinkPasswordResetEmail("user@example.com", "username123", "null?username=username123&token=token123");
        verify(jwtHelper, times(1)).generateForgotPasswordToken("username123");
    }

    // 2. Abnormal Test Case
    @Test
    public void forgotPassword_Fail_EmailNotFound() {
        // Arrange
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("nonexistent@example.com")
                .build();

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        EmailNotFoundException exception = assertThrows(EmailNotFoundException.class, () ->
                authService.forgotPassword(forgotPasswordDTO, response));
        assertEquals("Could not found user with email nonexistent@example.com", exception.getMessage());
        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
        verify(emailService, never()).sendLinkPasswordResetEmail(any(), any(), any());
    }

    /**
     * 3. Boundary Test Case: Email có độ dài tối thiểu
     * Mô tả: Email có độ dài tối thiểu hợp lệ (a@b.co)
     * Kỳ vọng: Trả về HTTP 200 OK kèm fpToken và username.
     */
    @Test
    public void forgotPassword_Boundary_MinValidEmail() throws MessagingException {
        // Arrange
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("a@b.co")
                .build();
        User user = new User();
        user.setUsername("username123");
        user.setEmail("a@b.co");

        when(userRepository.findByEmail("a@b.co")).thenReturn(Optional.of(user));
        when(emailService.sendLinkPasswordResetEmail("a@b.co", "username123", "null?username=username123&token=token123"))
                .thenReturn("Link password reset sent successfully!");
        when(jwtHelper.generateForgotPasswordToken("username123")).thenReturn("token123");

        // Act
        ForgotPasswordVO result = authService.forgotPassword(forgotPasswordDTO, response);

        // Assert
        assertNotNull(result);
        assertEquals("token123", result.fpToken());
        assertEquals("username123", result.username());
        verify(userRepository, times(1)).findByEmail("a@b.co");
        verify(emailService, times(1)).sendLinkPasswordResetEmail("a@b.co", "username123", "null?username=username123&token=token123");
    }

    // 4. Near Boundary Test Case: Email dài gần tối đa
    @Test
    public void forgotPassword_NearBoundary_LongValidEmail() throws MessagingException {
        // Arrange
        String longEmail = "a_very_long_email_address_1234567890abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz@example.com"; // < 254 chars
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email(longEmail)
                .build();
        User user = new User();
        user.setUsername("username123");
        user.setEmail(longEmail);

        when(userRepository.findByEmail(longEmail)).thenReturn(Optional.of(user));
        when(emailService.sendLinkPasswordResetEmail(longEmail, "username123", "null?username=username123&token=token123"))
                .thenReturn("Link password reset sent successfully!");
        when(jwtHelper.generateForgotPasswordToken("username123")).thenReturn("token123");

        // Act
        ForgotPasswordVO result = authService.forgotPassword(forgotPasswordDTO, response);

        // Assert
        assertNotNull(result);
        assertEquals("token123", result.fpToken());
        assertEquals("username123", result.username());
        verify(userRepository, times(1)).findByEmail(longEmail);
        verify(emailService, times(1)).sendLinkPasswordResetEmail(longEmail, "username123", "null?username=username123&token=token123");
    }

    // 5. Near Boundary Test Case: Email rỗng
    @Test
    public void forgotPassword_NearBoundary_EmptyEmail() {
        // Arrange
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("")
                .build();

        when(userRepository.findByEmail("")).thenReturn(Optional.empty());

        // Act & Assert
        EmailNotFoundException exception = assertThrows(EmailNotFoundException.class, () ->
                authService.forgotPassword(forgotPasswordDTO, response));
        assertEquals("Could not found user with email ", exception.getMessage());
        verify(userRepository, times(1)).findByEmail("");
        verify(emailService, never()).sendLinkPasswordResetEmail(any(), any(), any());
    }

    // 6. Far Boundary Test Case: Email chứa ký tự không hợp lệ
    @Test
    public void forgotPassword_FarBoundary_InvalidCharactersEmail() {
        // Arrange
        ForgotPasswordDTO forgotPasswordDTO = ForgotPasswordDTO.builder()
                .email("user><@example.com")
                .build();

        when(userRepository.findByEmail("user><@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        EmailNotFoundException exception = assertThrows(EmailNotFoundException.class, () ->
                authService.forgotPassword(forgotPasswordDTO, response));
        assertEquals("Could not found user with email user><@example.com", exception.getMessage());
        verify(userRepository, times(1)).findByEmail("user><@example.com");
        verify(emailService, never()).sendLinkPasswordResetEmail(any(), any(), any());
    }
}
