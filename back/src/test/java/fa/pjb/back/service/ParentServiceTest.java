package fa.pjb.back.service;

import static org.junit.jupiter.api.Assertions.*;

import fa.pjb.back.common.exception.email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception.user.UserNotCreatedException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.service.impl.ParentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;

@SpringBootTest
@ExtendWith(SpringExtension.class)
class ParentServiceTest {

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
        validReturnParent = new Parent(1,
                new User(1, "DoeJ1"
                        , "password123"
                        , "test@example.com"
                        , true
                        , "John Doe"
                        , ERole.ROLE_PARENT
                        , null
                        , "+84 123456789")
                , ""
                , ""
                , ""
                , "");
        validRegisterVO  = new RegisterVO("John Doe","test@example.com","+84 123456789", LocalDateTime.now());
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
