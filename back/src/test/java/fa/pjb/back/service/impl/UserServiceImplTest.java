//package fa.pjb.back.service.impl;
//
//import fa.pjb.back.common.exception.EmailExistException;
//import fa.pjb.back.common.exception.InvalidDateException;
//import fa.pjb.back.model.dto.UserDTO;
//import fa.pjb.back.model.entity.User;
//import fa.pjb.back.model.enums.ERole;
//import fa.pjb.back.model.mapper.UserMapper;
//import fa.pjb.back.repository.UserRepository;
//import fa.pjb.back.service.AuthService;
//import fa.pjb.back.service.EmailService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.time.LocalDate;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class UserServiceImplTest {
//
//    @Mock
//    private UserMapper userMapper;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private AuthService authService;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @Mock
//    private EmailService emailService;
//
//    @InjectMocks
//    private UserServiceImpl userService;
//
//    private UserDTO userDTO;
//
//    @BeforeEach
//    public void setUp() {
//        userDTO = new UserDTO();
//        userDTO.setEmail("test@example.com");
//        userDTO.setFullName("John Doe");
//        userDTO.setPhone("1234567890");
//        userDTO.setDob(LocalDate.of(1990, 1, 1));
//        userDTO.setStatus(true);
//    }
//
//    @Test
//    public void testCreateAdmin_Success() {
//        // Arrange
//        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
//        when(userRepository.countByUsernameStartingWith("JohnJD")).thenReturn(0L);
//        when(passwordEncoder.encode(any(String.class))).thenReturn("encodedPassword");
//
//        User savedUser = new User();
//        savedUser.setId(1);
//        savedUser.setUsername("JohnJD1");
//        savedUser.setPassword("encodedPassword");
//        savedUser.setEmail("test@example.com");
//        savedUser.setRole(ERole.ROLE_ADMIN);
//        savedUser.setStatus(true);
//        savedUser.setPhone("1234567890");
//        savedUser.setDob(LocalDate.of(1990, 1, 1));
//        savedUser.setFullname("John Doe");
//
//        when(userRepository.save(any(User.class))).thenReturn(savedUser);
//
//        // Act
//        UserDTO result = userService.createAdmin(userDTO);
//
//        // Assert
//        assertNotNull(result);
//        assertEquals(1, result.getId());
//        assertEquals("JohnJD1", result.getUsername());
//        assertEquals("test@example.com", result.getEmail());
//        assertEquals("ROLE_ADMIN", result.getRole());
//        assertTrue(result.getStatus());
//        assertEquals("1234567890", result.getPhone());
//        assertEquals(LocalDate.of(1990, 1, 1), result.getDob());
//        assertEquals("John Doe", result.getFullName());
//
//        verify(userRepository, times(1)).findByEmail("test@example.com");
//        verify(userRepository, times(1)).countByUsernameStartingWith("JohnJD");
//        verify(passwordEncoder, times(1)).encode(any(String.class));
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(emailService, times(1)).sendUsernamePassword(
//                eq("test@example.com"), eq("John Doe"), eq("JohnJD1"), any(String.class));
//    }
//
//    @Test
//    public void testCreateAdmin_EmailExistException() {
//        // Arrange
//        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new User()));
//
//        // Act & Assert
//        assertThrows(EmailExistException.class, () -> userService.createAdmin(userDTO));
//
//        verify(userRepository, times(1)).findByEmail("test@example.com");
//        verify(userRepository, never()).save(any(User.class));
//        verify(emailService, never()).sendUsernamePassword(anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    public void testCreateAdmin_InvalidDateException() {
//        // Arrange
//        userDTO.setDob(LocalDate.now().plusDays(1)); // Future date
//        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
//
//        // Act & Assert
//        assertThrows(InvalidDateException.class, () -> userService.createAdmin(userDTO));
//
//        verify(userRepository, times(1)).findByEmail("test@example.com");
//        verify(userRepository, never()).save(any(User.class));
//        verify(emailService, never()).sendUsernamePassword(anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    public void testCreateAdmin_GenerateUsernameWithCount() {
//        // Arrange
//        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
//        when(userRepository.countByUsernameStartingWith("JohnJD")).thenReturn(2L); // Already 2 users
//        when(passwordEncoder.encode(any(String.class))).thenReturn("encodedPassword");
//
//        User savedUser = new User();
//        savedUser.setId(1);
//        savedUser.setUsername("JohnJD3"); // Should append 3
//        savedUser.setPassword("encodedPassword");
//        savedUser.setEmail("test@example.com");
//        savedUser.setRole(ERole.ROLE_ADMIN);
//        savedUser.setStatus(true);
//        savedUser.setPhone("1234567890");
//        savedUser.setDob(LocalDate.of(1990, 1, 1));
//        savedUser.setFullname("John Doe");
//
//        when(userRepository.save(any(User.class))).thenReturn(savedUser);
//
//        // Act
//        UserDTO result = userService.createAdmin(userDTO);
//
//        // Assert
//        assertNotNull(result);
//        assertEquals("JohnJD3", result.getUsername());
//        verify(userRepository, times(1)).countByUsernameStartingWith("JohnJD");
//        verify(emailService, times(1)).sendUsernamePassword(
//                eq("test@example.com"), eq("John Doe"), eq("JohnJD3"), any(String.class));
//    }
//}