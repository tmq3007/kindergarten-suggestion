package fa.pjb.back.service.parent_service;

import fa.pjb.back.common.exception._10xx_user.UserNotCreatedException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.ParentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RegisterTest {

    @Mock
    private ParentRepository parentRepository;
    @Mock
    private AuthService authService;
    @Mock
    private UserService userService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private ParentMapper parentMapper;
    @InjectMocks
    private ParentServiceImpl parentService;
    @Mock
    private AutoGeneratorHelper autoGeneratorHelper;

    private RegisterDTO validRegisterDTO;
    private Parent validReturnParent;
    private RegisterVO validRegisterVO;

    @BeforeEach
    void setUp() {
        validRegisterDTO = new RegisterDTO("John Doe", "test@example.com", "+84 123456789", "password123");

        User user = User.builder()
                .id(1)
                .username("DoeJ1")
                .password("password123")
                .email("test@example.com")
                .status(true)
                .fullname("John Doe")
                .role(ERole.ROLE_PARENT)
                .phone("+84 123456789")
                .dob(LocalDate.now().minusYears(30))
                .build();

        // Create validReturnParent using builder pattern matching the actual Parent class
        validReturnParent = Parent.builder()
                .id(1)
                .user(user)
                .district("")
                .ward("")
                .province("")
                .street("")
                .media(null)
                .build();

        // Set bidirectional relationship since User has a Parent reference
        user.setParent(validReturnParent);

        validRegisterVO = new RegisterVO("John Doe", "test@example.com", "+84 123456789", LocalDateTime.now());
    }

    @Test
    void shouldSaveNewParentSuccessfully() throws UserNotCreatedException {
        Mockito.when(authService.checkEmailExists("test@example.com")).thenReturn(false);
        Mockito.when(parentRepository.save(Mockito.any())).thenReturn(validReturnParent);
        Mockito.when(autoGeneratorHelper.generateUsername(Mockito.any())).thenReturn("DoeJ1");
        Mockito.when(passwordEncoder.encode(Mockito.any())).thenReturn("password123");
        Mockito.when(parentMapper.toRegisterVO(Mockito.any())).thenReturn(validRegisterVO);

        RegisterVO result = parentService.saveNewParent(validRegisterDTO);

        assertNotNull(result);
        assertEquals("test@example.com", result.email());
        assertEquals("John Doe", result.fullname());
        assertEquals("+84 123456789", result.phone());
    }

    @Test
    void shouldThrowExceptionWhenEmailExists() {
        Mockito.when(authService.checkEmailExists("test@example.com")).thenReturn(true);
        EmailAlreadyExistedException thrown = assertThrows(EmailAlreadyExistedException.class, () -> {
            parentService.saveNewParent(validRegisterDTO);
        });

        assertEquals("Email already exists", thrown.getMessage());
        verify(parentRepository, never()).save(Mockito.any());
    }

    @Test
    void shouldThrowExceptionWhenSavingFails() {
        Mockito.when(authService.checkEmailExists("test@example.com")).thenReturn(false);
        Mockito.when(parentRepository.save(Mockito.any())).thenThrow(JpaSystemException.class);

        UserNotCreatedException thrown = assertThrows(UserNotCreatedException.class, () -> {
            parentService.saveNewParent(validRegisterDTO);
        });

        assertTrue(thrown.getMessage().contains("Registration failed!"));
    }

}