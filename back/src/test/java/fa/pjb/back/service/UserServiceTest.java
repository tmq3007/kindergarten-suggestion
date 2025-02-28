package fa.pjb.back.service;

import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
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
}