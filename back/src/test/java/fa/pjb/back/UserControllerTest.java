package fa.pjb.back;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.controller.UserController;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserControllerTest {

  @InjectMocks
  private UserController userController;

  @Mock
  private UserService userService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  // Test cho getUserDetail
  @Test
  void testGetUserDetail_Success() {
    // Normal case: Lấy thông tin user thành công
    int userId = 1;
    UserDetailDTO userDetailDTO = new UserDetailDTO(1, "testuser", "Test User", "test@example.com", "2023-01-01", "0123456789", "USER", "Active");

    when(userService.getUserDetailById(userId)).thenReturn(userDetailDTO);

    ApiResponse<UserDetailDTO> response = userController.getUserDetail(userId);

    assertEquals(HttpStatus.OK.value(), response.getCode());
    assertEquals("User detail retrieved successfully", response.getMessage());
    assertEquals(userDetailDTO, response.getData());
    verify(userService, times(1)).getUserDetailById(userId);
  }

  @Test
  void testGetUserDetail_UserNotFound() {
    // Abnormal case: User không tồn tại (trả về null hoặc throw exception)
    int userId = 999; // ID không tồn tại
    when(userService.getUserDetailById(userId)).thenReturn(null);

    ApiResponse<UserDetailDTO> response = userController.getUserDetail(userId);

    assertNotNull(response); // Đảm bảo response không null
    assertEquals(HttpStatus.OK.value(), response.getCode()); // Giả định backend trả về 200 với data null
    assertNull(response.getData()); // Kiểm tra data là null
    assertEquals("User detail retrieved successfully", response.getMessage()); // Kiểm tra message
    verify(userService, times(1)).getUserDetailById(userId);
  }

  @Test
  void testGetUserDetail_InvalidUserId() {
    // Edge case: ID âm hoặc 0 (bất hợp lệ)
    int invalidUserId = -1;
    when(userService.getUserDetailById(invalidUserId)).thenReturn(null); // Giả định trả về null cho ID bất hợp lệ

    ApiResponse<UserDetailDTO> response = userController.getUserDetail(invalidUserId);

    assertNotNull(response);
    assertEquals(HttpStatus.OK.value(), response.getCode());
    assertNull(response.getData());
    assertEquals("User detail retrieved successfully", response.getMessage());
    verify(userService, times(1)).getUserDetailById(invalidUserId);
  }

  // Test cho updateUser
  @Test
  void testUpdateUser_Success() {
    // Normal case: Cập nhật user thành công
    UserUpdateDTO userUpdateDTO = new UserUpdateDTO(
        1,
        "updateduser",
        "Updated User",
        "updated@example.com",
        "2023-01-01",
        "0987654321",
        "ADMIN",
        "Active"
    );

    UserDetailDTO updatedUserDTO = new UserDetailDTO(1, "updateduser", "Updated User", "updated@example.com", "2023-01-01", "0987654321", "ADMIN", "Active");

    when(userService.updateUser(userUpdateDTO)).thenReturn(updatedUserDTO);

    ApiResponse<UserDetailDTO> response = userController.updateUser(userUpdateDTO);

    assertEquals(HttpStatus.OK.value(), response.getCode());
    assertEquals("User updated successfully", response.getMessage());
    assertEquals(updatedUserDTO, response.getData());
    verify(userService, times(1)).updateUser(userUpdateDTO);
  }

  @Test
  void testUpdateUser_UserNotFound() {
    // Abnormal case: User không tồn tại (trả về null hoặc throw exception)
    UserUpdateDTO userUpdateDTO = new UserUpdateDTO(
        999, // ID không tồn tại
        "updateduser",
        "Updated User",
        "updated@example.com",
        "2023-01-01",
        "0987654321",
        "ADMIN",
        "Active"
    );

    when(userService.updateUser(userUpdateDTO)).thenReturn(null); // Giả định trả về null nếu không tìm thấy user

    ApiResponse<UserDetailDTO> response = userController.updateUser(userUpdateDTO);

    assertNotNull(response);
    assertEquals(HttpStatus.OK.value(), response.getCode()); // Giả định backend trả về 200 với data null
    assertNull(response.getData());
    assertEquals("User updated successfully", response.getMessage()); // Kiểm tra message
    verify(userService, times(1)).updateUser(userUpdateDTO);
  }

  @Test
  void testUpdateUser_InvalidData() {
    // Edge case: Dữ liệu không hợp lệ (ví dụ: phone không đúng định dạng)
    UserUpdateDTO userUpdateDTO = new UserUpdateDTO(
        1,
        "updateduser",
        "Updated User",
        "updated@example.com",
        "2023-01-01",
        "123456789", // Phone không bắt đầu bằng 0, vi phạm pattern
        "ADMIN",
        "Active"
    );

    // Giả định service throw exception hoặc trả về null khi dữ liệu không hợp lệ
    when(userService.updateUser(userUpdateDTO)).thenThrow(new IllegalArgumentException("Invalid phone number format"));

    ApiResponse<UserDetailDTO> response = userController.updateUser(userUpdateDTO);

    assertNotNull(response);
    assertEquals(HttpStatus.OK.value(), response.getCode()); // Giả định backend xử lý exception và trả về 200 với data null
    assertNull(response.getData());
    assertEquals("User updated successfully", response.getMessage()); // Kiểm tra message
    verify(userService, times(1)).updateUser(userUpdateDTO);
  }

  // Test cho toggleUserStatus
  @Test
  void testToggleUserStatus_Success() {
    // Normal case: Toggle status thành công
    int userId = 1;
    UserDetailDTO updatedUserDTO = new UserDetailDTO(1, "testuser", "Test User", "test@example.com", "2023-01-01", "0123456789", "USER", "Inactive");

    when(userService.toggleStatus(userId)).thenReturn(updatedUserDTO);

    ApiResponse<UserDetailDTO> response = userController.toggleUserStatus(userId);

    assertEquals(HttpStatus.OK.value(), response.getCode());
    assertEquals("User status toggled successfully", response.getMessage());
    assertEquals(updatedUserDTO, response.getData());
    verify(userService, times(1)).toggleStatus(userId);
  }

  @Test
  void testToggleUserStatus_UserNotFound() {
    // Abnormal case: User không tồn tại (trả về null hoặc throw exception)
    int userId = 999; // ID không tồn tại
    when(userService.toggleStatus(userId)).thenReturn(null); // Giả định trả về null nếu không tìm thấy user

    ApiResponse<UserDetailDTO> response = userController.toggleUserStatus(userId);

    assertNotNull(response);
    assertEquals(HttpStatus.OK.value(), response.getCode()); // Giả định backend trả về 200 với data null
    assertNull(response.getData());
    assertEquals("User status toggled successfully", response.getMessage()); // Kiểm tra message
    verify(userService, times(1)).toggleStatus(userId);
  }

  @Test
  void testToggleUserStatus_InvalidUserId() {
    // Edge case: ID âm hoặc 0 (bất hợp lệ)
    int invalidUserId = -1;
    when(userService.toggleStatus(invalidUserId)).thenReturn(null); // Giả định trả về null cho ID bất hợp lệ

    ApiResponse<UserDetailDTO> response = userController.toggleUserStatus(invalidUserId);

    assertNotNull(response);
    assertEquals(HttpStatus.OK.value(), response.getCode());
    assertNull(response.getData());
    assertEquals("User status toggled successfully", response.getMessage());
    verify(userService, times(1)).toggleStatus(invalidUserId);
  }
}