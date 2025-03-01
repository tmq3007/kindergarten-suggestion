package fa.pjb.back.service;

import fa.pjb.back.service.impl.EmailServiceImpl;
import freemarker.template.Configuration;
import freemarker.template.Template;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class EmailServiceTest {

    @InjectMocks
    private EmailServiceImpl emailService;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private Configuration freemarkerConfig;

    @Mock
    private Template template;

    @Mock
    private MimeMessage mimeMessage;

    @BeforeEach
    public void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    // 1. Normal Test Case
    @Test
    public void sendLinkPasswordResetEmail_Success() throws Exception {
        // Arrange
        String to = "user@example.com";
        String name = "John Doe";
        String resetLink = "https://example.com/reset?token=abc123";

        when(freemarkerConfig.getTemplate("email/password-reset.html")).thenReturn(template);
        doAnswer(invocation -> null).when(template).process(any(), any());

        // Act
        String result = emailService.sendLinkPasswordResetEmail(to, name, resetLink);

        // Assert
        assertEquals("Link password reset sent successfully!", result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    // 2. Abnormal Test Case
    @Test
    public void sendLinkPasswordResetEmail_Fail_InvalidEmail() throws Exception {
        // Arrange
        String to = "invalid-email@";
        String name = "John Doe";
        String resetLink = "https://example.com/reset?token=abc123";

        when(freemarkerConfig.getTemplate("email/password-reset.html")).thenReturn(template);
        doAnswer(invocation -> null).when(template).process(any(), any());
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // Act
        String result = emailService.sendLinkPasswordResetEmail(to, name, resetLink);

        // Assert
        assertEquals("Error while sending email: Missing domain", result);
        verify(mailSender, never()).send(any(MimeMessage.class));
        verify(mailSender, times(1)).createMimeMessage();
    }

    // 3. Boundary Test Case: Email trống
    @Test
    public void sendLinkPasswordResetEmail_Boundary_EmptyEmail() throws Exception {
        // Arrange
        String to = "";
        String name = "John Doe";
        String resetLink = "https://example.com/reset?token=abc123";

        when(freemarkerConfig.getTemplate("email/password-reset.html")).thenReturn(template);
        doAnswer(invocation -> null).when(template).process(any(), any());
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // Act
        String result = emailService.sendLinkPasswordResetEmail(to, name, resetLink);

        // Assert
        assertEquals("Error while sending email: Illegal address", result);
        verify(mailSender, never()).send(any(MimeMessage.class));
        verify(mailSender, times(1)).createMimeMessage();
    }

    // 4. Boundary Test Case: Tên rỗng (Min valid name)
    @Test
    public void sendLinkPasswordResetEmail_Boundary_MinValidName() throws Exception {
        // Arrange
        String to = "user@example.com";
        String name = "";
        String resetLink = "https://example.com/reset?token=abc123";

        when(freemarkerConfig.getTemplate("email/password-reset.html")).thenReturn(template);
        doAnswer(invocation -> null).when(template).process(any(), any());

        // Act
        String result = emailService.sendLinkPasswordResetEmail(to, name, resetLink);

        // Assert
        assertEquals("Link password reset sent successfully!", result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    // 5. Near Boundary Test Case: Email dài gần tối đa
    @Test
    public void sendLinkPasswordResetEmail_NearBoundary_LongEmail() throws Exception {
        // Arrange
        String longEmail = "a_very_long_email_address_1234567890abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz@example.com"; // < 254 chars
        String name = "John Doe";
        String resetLink = "https://example.com/reset?token=abc123";

        when(freemarkerConfig.getTemplate("email/password-reset.html")).thenReturn(template);
        doAnswer(invocation -> null).when(template).process(any(), any());

        // Act
        String result = emailService.sendLinkPasswordResetEmail(longEmail, name, resetLink);

        // Assert
        assertEquals("Link password reset sent successfully!", result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    // 6. Far Boundary Test Case: Email vượt quá độ dài tối đa
    @Test
    public void sendLinkPasswordResetEmail_FarBoundary_OverMaxLengthEmail() throws Exception {
        // Arrange
        String overMaxEmail = "a_very_long_email_address_1234567890abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz@example.com"; // > 254 chars
        String name = "John Doe";
        String resetLink = "https://example.com/reset?token=abc123";

        when(freemarkerConfig.getTemplate("email/password-reset.html")).thenReturn(template);
        doAnswer(invocation -> null).when(template).process(any(), any());
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // Act
        String result = emailService.sendLinkPasswordResetEmail(overMaxEmail, name, resetLink);

        // Assert
        assertEquals("Error while sending email: Email address too long", result);
        verify(mailSender, never()).send(any(MimeMessage.class));
        verify(mailSender, never()).createMimeMessage();
    }

    // 7. Far Boundary Test Case: Reset link rỗng
    @Test
    public void sendLinkPasswordResetEmail_FarBoundary_EmptyResetLink() throws Exception {
        // Arrange
        String to = "user@example.com";
        String name = "John Doe";
        String resetLink = "";

        when(freemarkerConfig.getTemplate("email/password-reset.html")).thenReturn(template);
        doAnswer(invocation -> null).when(template).process(any(), any());

        // Act
        String result = emailService.sendLinkPasswordResetEmail(to, name, resetLink);

        // Assert
        assertEquals("Link password reset sent successfully!", result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
