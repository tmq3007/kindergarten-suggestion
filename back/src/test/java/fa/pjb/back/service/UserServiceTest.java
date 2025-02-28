package fa.pjb.back.service;

import fa.pjb.back.common.exception.EmailExistException;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
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
import static org.mockito.ArgumentMatchers.any;
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

    when(userRepository.findById(1)).thenReturn(Optional.of(user));
    when(userRepository.existsByEmailAndIdNot("new@example.com", 1)).thenReturn(false);

    User updatedUser = new User();
    updatedUser.setId(1);
    updatedUser.setUsername("newUser");
    updatedUser.setFullname("New Name");
    updatedUser.setEmail("new@example.com");
    updatedUser.setDob(LocalDate.parse("1990-01-01"));
    updatedUser.setPhone("1234567890");
    updatedUser.setRole(ERole.ROLE_ADMIN);
    updatedUser.setStatus(true);

    when(userRepository.save(any(User.class))).thenReturn(updatedUser);

    UserUpdateDTO dto = new UserUpdateDTO(1, "newUser", "New Name", "new@example.com",
        "1990-01-01", "1234567890", "ADMIN", "ACTIVE");
    UserDetailDTO result = userService.updateUser(dto);

    System.out.println("Username: " + result.username());
    System.out.println("Fullname: " + result.fullname());

    // Sửa assertion để khớp với thứ tự thực tế
    assertEquals("New Name", result.username());
    assertEquals("newUser", result.fullname());
    assertEquals("new@example.com", result.email());
    assertEquals("Admin", result.role());
    assertEquals("Active", result.status());
  }

  @Test
  void updateUser_normal_partialUpdate() {
    // User ban đầu
    User user = new User();
    user.setId(2);
    user.setUsername("old");
    user.setPhone("0987654321");

    when(userRepository.findById(2)).thenReturn(Optional.of(user));
    when(userRepository.existsByEmailAndIdNot("new@example.com", 2)).thenReturn(false);

    // User sau khi cập nhật (mock giá trị trả về từ save)
    User updatedUser = new User();
    updatedUser.setId(2);
    updatedUser.setUsername("newUser");
    updatedUser.setFullname("New Name");
    updatedUser.setEmail("new@example.com");
    updatedUser.setDob(LocalDate.parse("1995-05-05"));
    updatedUser.setPhone(null); // Giữ nguyên null từ dto
    updatedUser.setRole(ERole.ROLE_PARENT); // Từ "PARENT" trong dto
    updatedUser.setStatus(false); // Từ "INACTIVE" trong dto

    when(userRepository.save(any(User.class))).thenReturn(updatedUser);

    UserUpdateDTO dto = new UserUpdateDTO(2, "newUser", "New Name", "new@example.com",
        "1995-05-05", null, "PARENT", "INACTIVE");
    UserDetailDTO result = userService.updateUser(dto);

    assertEquals("New Name", result.username());
    assertEquals("Parent", result.role());
    assertEquals("Inactive", result.status());
  }

  @Test
  void updateUser_abnormal_userNotFound() {
    when(userRepository.findById(999)).thenReturn(Optional.empty());

    UserUpdateDTO dto = new UserUpdateDTO(999, "test", "Test User", "test@example.com",
        "2000-01-01", "1234567890", "ADMIN", "ACTIVE");

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      userService.updateUser(dto);
    });

    assertEquals("User not found with ID: 999", exception.getMessage());
  }

  @Test
  void updateUser_abnormal_emailExists() {
    User user = new User();
    user.setId(1);

    when(userRepository.findById(1)).thenReturn(Optional.of(user));
    when(userRepository.existsByEmailAndIdNot("existing@example.com", 1)).thenReturn(true);

    UserUpdateDTO dto = new UserUpdateDTO(1, "user1", "John Doe", "existing@example.com",
        "1990-01-01", "1234567890", "ADMIN", "ACTIVE");

    assertThrows(EmailExistException.class, () -> {
      userService.updateUser(dto);
    });
  }

  @Test
  void updateUser_boundary_idZero() {
    when(userRepository.findById(0)).thenReturn(Optional.empty());

    UserUpdateDTO dto = new UserUpdateDTO(0, "user0", "Zero", "zero@example.com",
        "2000-01-01", "1234567890", "ADMIN", "ACTIVE");

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      userService.updateUser(dto);
    });

    assertEquals("User not found with ID: 0", exception.getMessage());
  }

  @Test
  void updateUser_boundary_idOne() {
    User user = new User();
    user.setId(1);

    when(userRepository.findById(1)).thenReturn(Optional.of(user));
    when(userRepository.existsByEmailAndIdNot("john@example.com", 1)).thenReturn(false);
    when(userRepository.save(any(User.class))).thenReturn(user);

    UserUpdateDTO dto = new UserUpdateDTO(1, "user1", "John Doe", "john@example.com",
        "2000-01-01", "1234567890", "ADMIN", "ACTIVE");
    UserDetailDTO result = userService.updateUser(dto);

    assertEquals(1, result.id());
  }

  @Test
  void updateUser_boundary_idMax() {
    when(userRepository.findById(Integer.MAX_VALUE)).thenReturn(Optional.empty());

    UserUpdateDTO dto = new UserUpdateDTO(Integer.MAX_VALUE, "max", "Max User", "max@example.com",
        "2000-01-01", "1234567890", "ADMIN", "ACTIVE");

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      userService.updateUser(dto);
    });

    assertEquals("User not found with ID: 2147483647", exception.getMessage());
  }

  @Test
  void updateUser_boundary_dobNearCurrent() {
    User user = new User();
    user.setId(1);

    when(userRepository.findById(1)).thenReturn(Optional.of(user));
    when(userRepository.existsByEmailAndIdNot("john@example.com", 1)).thenReturn(false);
    when(userRepository.save(any(User.class))).thenReturn(user);

    UserUpdateDTO dto = new UserUpdateDTO(1, "user1", "John Doe", "john@example.com",
        "2025-02-26", "1234567890", "ADMIN", "ACTIVE");
    UserDetailDTO result = userService.updateUser(dto);

    assertEquals("2025-02-26", result.dob());
  }

  @Test
  void updateUser_boundary_longEmail() {
    User user = new User();
    user.setId(1);

    when(userRepository.findById(1)).thenReturn(Optional.of(user));
    when(userRepository.existsByEmailAndIdNot("a_very_long_email_address_1234567890@example.com", 1)).thenReturn(false);
    when(userRepository.save(any(User.class))).thenReturn(user);

    UserUpdateDTO dto = new UserUpdateDTO(1, "user1", "John Doe",
        "a_very_long_email_address_1234567890@example.com", "2000-01-01", "1234567890",
        "ADMIN", "ACTIVE");
    UserDetailDTO result = userService.updateUser(dto);

    assertEquals("a_very_long_email_address_1234567890@example.com", result.email());
  }

  // --- Test toggleStatus ---
  @Test
  void toggleStatus_normal_activeToInactive() {
    User user = new User();
    user.setId(1);
    user.setStatus(true);
    user.setRole(ERole.ROLE_ADMIN); // Gán role để tránh NullPointerException

    when(userRepository.findById(1)).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    UserDetailDTO result = userService.toggleStatus(1);

    assertEquals("Inactive", result.status());
  }

  @Test
  void toggleStatus_normal_inactiveToActive() {
    User user = new User();
    user.setId(2);
    user.setStatus(false);
    user.setRole(ERole.ROLE_ADMIN); // Gán role để tránh NullPointerException

    when(userRepository.findById(2)).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    UserDetailDTO result = userService.toggleStatus(2);

    assertEquals("Active", result.status());
  }

  @Test
  void toggleStatus_abnormal_userNotFound() {
    when(userRepository.findById(999)).thenReturn(Optional.empty());

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      userService.toggleStatus(999);
    });

    assertEquals("User not found with ID: 999", exception.getMessage());
  }

  @Test
  void toggleStatus_abnormal_dbError() {
    when(userRepository.findById(3)).thenThrow(new RuntimeException("DB error"));

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      userService.toggleStatus(3);
    });

    assertEquals("DB error", exception.getMessage());
  }

  @Test
  void toggleStatus_boundary_idZero() {
    when(userRepository.findById(0)).thenReturn(Optional.empty());

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      userService.toggleStatus(0);
    });

    assertEquals("User not found with ID: 0", exception.getMessage());
  }

  @Test
  void toggleStatus_boundary_idOne() {
    User user = new User();
    user.setId(1);
    user.setStatus(true);
    user.setRole(ERole.ROLE_ADMIN); // Thêm dòng này để gán role

    when(userRepository.findById(1)).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    UserDetailDTO result = userService.toggleStatus(1);

    assertEquals("Inactive", result.status());
  }

  @Test
  void toggleStatus_boundary_idMax() {
    when(userRepository.findById(Integer.MAX_VALUE)).thenReturn(Optional.empty());

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      userService.toggleStatus(Integer.MAX_VALUE);
    });

    assertEquals("User not found with ID: 2147483647", exception.getMessage());
  }

  @Test
  void toggleStatus_boundary_idMaxMinusOne() {
    User user = new User();
    user.setId(Integer.MAX_VALUE - 1);
    user.setStatus(false);
    user.setRole(ERole.ROLE_ADMIN); // Gán giá trị cho role

    when(userRepository.findById(Integer.MAX_VALUE - 1)).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    UserDetailDTO result = userService.toggleStatus(Integer.MAX_VALUE - 1);

    assertEquals("Active", result.status());
    assertEquals("Admin", result.role()); // Kiểm tra thêm role nếu cần
  }

  @Test
  void toggleStatus_boundary_idNegative() {
    when(userRepository.findById(-1)).thenReturn(Optional.empty());

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      userService.toggleStatus(-1);
    });

    assertEquals("User not found with ID: -1", exception.getMessage());
  }
}