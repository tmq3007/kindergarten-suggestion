package fa.pjb.back.service;

import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.UserMapper;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private AutoGeneratorHelper autoGeneratorHelper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserServiceImpl userService;

    private UserCreateDTO userCreateDTO;
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userCreateDTO = UserCreateDTO.builder()
                .fullname("Test User")
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("+1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .build();
    }

    // --- Test getUserDetailById ---
    @Test
    void getUserDetailById_normal_fullInfo() {
        User user = new User();
        user.setId(1);
        user.setUsername("admin1");
        user.setFullname("Admin One");
        user.setEmail("admin1@example.com");
        user.setDob(LocalDate.of(1990, 1, 1));
        user.setPhone("1234567890");
        user.setRole(ERole.ROLE_ADMIN);
        user.setStatus(true);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        UserDetailDTO result = userService.getUserDetailById(1);

        assertEquals(1, result.id());
        assertEquals("admin1", result.username());
        assertEquals("Admin One", result.fullname());
        assertEquals("admin1@example.com", result.email());
        assertEquals("1990-01-01", result.dob());
        assertEquals("1234567890", result.phone());
        assertEquals("Admin", result.role());
        assertEquals("Active", result.status());
    }

    @Test
    void getUserDetailById_normal_missingDob() {
        User user = new User();
        user.setId(2);
        user.setUsername("parent1");
        user.setFullname("Parent One");
        user.setEmail("parent1@example.com");
        user.setDob(null);
        user.setPhone("0987654321");
        user.setRole(ERole.ROLE_PARENT);
        user.setStatus(false);

        when(userRepository.findById(2)).thenReturn(Optional.of(user));

        UserDetailDTO result = userService.getUserDetailById(2);

        assertEquals(2, result.id());
        assertEquals("parent1", result.username());
        assertEquals("Parent One", result.fullname());
        assertNull(result.dob());
        assertEquals("Parent", result.role());
        assertEquals("Inactive", result.status());
    }

    @Test
    void getUserDetailById_abnormal_userNotFound() {
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserDetailById(999);
        });

        assertEquals("User not found with ID: 999", exception.getMessage());
    }

    @Test
    void getUserDetailById_abnormal_dbError() {
        when(userRepository.findById(3)).thenThrow(new RuntimeException("DB error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserDetailById(3);
        });

        assertEquals("DB error", exception.getMessage());
    }

    @Test
    void getUserDetailById_boundary_idZero() {
        when(userRepository.findById(0)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserDetailById(0);
        });

        assertEquals("User not found with ID: 0", exception.getMessage());
    }

    @Test
    void getUserDetailById_boundary_idOne() {
        User user = new User();
        user.setId(1);
        user.setUsername("user1");
        user.setRole(ERole.ROLE_ADMIN);
        user.setStatus(true);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        UserDetailDTO result = userService.getUserDetailById(1);
        assertEquals(1, result.id());
    }

    @Test
    void getUserDetailById_boundary_idMax() {
        when(userRepository.findById(Integer.MAX_VALUE)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserDetailById(Integer.MAX_VALUE);
        });

        assertEquals("User not found with ID: 2147483647", exception.getMessage());
    }

    @Test
    void getUserDetailById_boundary_idMaxMinusOne() {
        User user = new User();
        user.setId(Integer.MAX_VALUE - 1);
        user.setUsername("max");
        user.setRole(ERole.ROLE_ADMIN);
        user.setStatus(true);

        when(userRepository.findById(Integer.MAX_VALUE - 1)).thenReturn(Optional.of(user));

        UserDetailDTO result = userService.getUserDetailById(Integer.MAX_VALUE - 1);
        assertEquals(Integer.MAX_VALUE - 1, result.id());
    }

    @Test
    void getUserDetailById_boundary_idNegative() {
        when(userRepository.findById(-1)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserDetailById(-1);
        });

        assertEquals("User not found with ID: -1", exception.getMessage());
    }

    @Test
    void updateUser_normal_fullUpdate() {
        User user = new User();
        user.setId(1);
        user.setUsername("old");
        user.setEmail("old@example.com");
    }

    /** Normal Case: Tạo user thành công với role ADMIN */
    @Test
    void createUser_Success_WithAdminRole() {
        // Arrange
        String generatedUsername = "testuser_gen";
        String generatedPassword = "randomPass123";
        User user = User.builder()
                .username(generatedUsername)
                .password("encodedPass")
                .email("test@example.com")
                .fullname("Test User")
                .phone("+1234567890")
                .status(true)
                .dob(LocalDate.of(1990, 1, 1))
                .role(ERole.ROLE_ADMIN)
                .build();
        UserCreateDTO responseDTO = UserCreateDTO.builder()
                .fullname("Test User")
                .email("test@example.com")
                .build();

        when(autoGeneratorHelper.generateUsername("Test User")).thenReturn(generatedUsername);
        when(autoGeneratorHelper.generateRandomPassword()).thenReturn(generatedPassword);
        when(passwordEncoder.encode(generatedPassword)).thenReturn("encodedPass");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toUserDTO(user)).thenReturn(responseDTO);

        // Act
         userService.createUser(userCreateDTO);

        // Assert
        assertNotNull(userCreateDTO);
        assertEquals("Test User", userCreateDTO.fullname());
        assertEquals("test@example.com", userCreateDTO.email());
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, times(1)).sendUsernamePassword("test@example.com", "Test User", generatedUsername, generatedPassword);
        verify(schoolOwnerRepository, never()).save(any());
    }

    /** Normal Case: Tạo user thành công với role SCHOOL_OWNER */
    @Test
    void createUser_Success_WithSchoolOwnerRole() {
        // Arrange
        userCreateDTO = UserCreateDTO.builder()
                .username("schoolowner") // Thêm username
                .fullname("School Owner")
                .password("password123") // Thêm password
                .email("owner@example.com")
                .role("ROLE_SCHOOL_OWNER")
                .status(true)
                .phone("+1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Expected School")
                .build();
        String generatedUsername = "owner_gen";
        String generatedPassword = "randomPass456";
        User user = User.builder()
                .username(generatedUsername)
                .password("encodedPass")
                .email("owner@example.com")
                .fullname("School Owner")
                .phone("+1234567890")
                .status(true)
                .dob(LocalDate.of(1990, 1, 1))
                .role(ERole.ROLE_SCHOOL_OWNER)
                .build();
        SchoolOwner schoolOwner = SchoolOwner.builder()
                .user(user)
                .expectedSchool("Expected School")
                .publicPermission(true)
                .assignTime(LocalDate.from(LocalDateTime.now()))
                .build();
        UserCreateDTO responseDTO = UserCreateDTO.builder()
                .username("schoolowner")
                .fullname("School Owner")
                .password("password123")
                .email("owner@example.com")
                .role("ROLE_SCHOOL_OWNER")
                .status(true)
                .phone("+1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Expected School")
                .build();

        when(autoGeneratorHelper.generateUsername("School Owner")).thenReturn(generatedUsername);
        when(autoGeneratorHelper.generateRandomPassword()).thenReturn(generatedPassword);
        when(passwordEncoder.encode(generatedPassword)).thenReturn("encodedPass");
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(schoolOwnerRepository.save(any(SchoolOwner.class))).thenReturn(schoolOwner);
        when(userMapper.toUserDTO(user)).thenReturn(responseDTO);

        // Act
        userService.createUser(userCreateDTO);

        // Assert
        assertNotNull(userCreateDTO);
        assertEquals("School Owner", userCreateDTO.fullname());
        assertEquals("owner@example.com", userCreateDTO.email());
        verify(userRepository, times(1)).save(any(User.class));
        verify(schoolOwnerRepository, times(1)).save(any(SchoolOwner.class));
        verify(emailService, times(1)).sendUsernamePassword("owner@example.com", "School Owner", generatedUsername, generatedPassword);
    }

    /** Abnormal Case: Email đã tồn tại */
    @Test
    void createUser_Fail_EmailAlreadyExists() {
        // Arrange
        User existingUser = User.builder().id(1).email("test@example.com").build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        // Act & Assert
        assertThrows(EmailAlreadyExistedException.class, () ->
                userService.createUser(userCreateDTO));
        verify(userRepository, never()).save(any());
        verify(schoolOwnerRepository, never()).save(any());
        verify(emailService, never()).sendUsernamePassword(any(), any(), any(), any());
    }

    /** Abnormal Case: Ngày sinh không hợp lệ (tương lai) */
    @Test
    void createUser_Fail_InvalidDob() {
        // Arrange
        userCreateDTO = UserCreateDTO.builder()
                .fullname("Invalid DOB User")
                .email("invalid@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("+1234567890")
                .dob(LocalDate.now().plusDays(1)) // Future date
                .build();
        when(userRepository.findByEmail("invalid@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidDateException.class, () ->
                userService.createUser(userCreateDTO));
        verify(userRepository, never()).save(any());
        verify(schoolOwnerRepository, never()).save(any());
        verify(emailService, never()).sendUsernamePassword(any(), any(), any(), any());
    }


    /** Boundary Case: Email null */
    @Test
    void createUser_Fail_NullEmail() {
        // Arrange
        userCreateDTO = UserCreateDTO.builder()
                .fullname("Null Email User")
                .email(null)
                .role("ROLE_ADMIN")
                .status(true)
                .phone("+1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
                userService.createUser(userCreateDTO));
        verify(userRepository, never()).findByEmail(any());
        verify(userRepository, never()).save(any());
        verify(schoolOwnerRepository, never()).save(any());
        verify(emailService, never()).sendUsernamePassword(any(), any(), any(), any());
    }

    /** Boundary Case: DOB null */
    @Test
    void createUser_Fail_NullDob() {
        // Arrange
        userCreateDTO = UserCreateDTO.builder()
                .fullname("Null DOB User")
                .email("null@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("+1234567890")
                .dob(null)
                .build();
        when(userRepository.findByEmail("null@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidDateException.class, () ->
                userService.createUser(userCreateDTO));
        verify(userRepository, never()).save(any());
        verify(schoolOwnerRepository, never()).save(any());
        verify(emailService, never()).sendUsernamePassword(any(), any(), any(), any());
    }
}