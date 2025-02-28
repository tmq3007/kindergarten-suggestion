package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.EmailExistException;
import fa.pjb.back.common.exception.IncorrectPasswordException;
import fa.pjb.back.common.exception.InvalidDateException;
import fa.pjb.back.common.exception.user.UserNotFoundException;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ParentServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParentRepository parentRepository;

    @Mock
    private ParentMapper parentMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ParentServiceImpl parentService;

    private ParentDTO parentDTO;
    private User user;
    private Parent parent;

    @BeforeEach
    public void setUp() {
        parentDTO = new ParentDTO();
        parentDTO.setEmail("test@example.com");
        parentDTO.setFullName("John Doe");
        parentDTO.setPhone("1234567890");
        parentDTO.setDob(LocalDate.of(1990, 1, 1));
        parentDTO.setStatus(true);
        parentDTO.setDistrict("District 1");
        parentDTO.setWard("Ward 1");
        parentDTO.setProvince("Province 1");
        parentDTO.setStreet("123 Street");

        user = User.builder()
                .id(1)
                .email("test@example.com")
                .username("JohnD1")
                .password("encodedPassword")
                .role(ERole.ROLE_PARENT)
                .phone("1234567890")
                .fullname("John Doe")
                .status(true)
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        parent = Parent.builder()
                .id(1)
                .user(user)
                .district("District 1")
                .ward("Ward 1")
                .province("Province 1")
                .street("123 Street")
                .build();
    }

    /**
     * ✅ Trường hợp bình thường (Normal Case)
     * Mô tả: Tạo parent thành công với dữ liệu hợp lệ.
     * Kỳ vọng: Trả về ParentDTO đã tạo, gọi các phương thức lưu và gửi email đúng một lần.
     */
    @Test
    public void testCreateParent_Success() {
        // Arrange
        when(userRepository.findByEmail(parentDTO.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(parentRepository.save(any(Parent.class))).thenReturn(parent);
        when(parentMapper.toParentDTO(any(Parent.class))).thenReturn(parentDTO);

        // Act
        ParentDTO result = parentService.createParent(parentDTO);

        // Assert
        assertNotNull(result);
        assertEquals(parentDTO.getEmail(), result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
        verify(parentRepository, times(1)).save(any(Parent.class));
        verify(emailService, times(1)).sendUsernamePassword(anyString(), anyString(), anyString(), anyString());
    }

    /**
     * ❌ Trường hợp bất thường (Abnormal Case)
     * Mô tả: Tạo parent thất bại khi email đã tồn tại.
     * Kỳ vọng: Ném ra EmailExistException, không gọi phương thức lưu.
     */
    @Test
    public void testCreateParent_EmailExists_ThrowsException() {
        // Arrange
        when(userRepository.findByEmail(parentDTO.getEmail())).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(EmailExistException.class, () -> parentService.createParent(parentDTO));
        verify(userRepository, never()).save(any(User.class));
        verify(parentRepository, never()).save(any(Parent.class));
    }

    /**
     * ❌ Trường hợp bất thường (Abnormal Case)
     * Mô tả: Tạo parent thất bại khi ngày sinh nằm trong tương lai.
     * Kỳ vọng: Ném ra InvalidDateException, không gọi phương thức lưu.
     */
    @Test
    public void testCreateParent_InvalidDob_ThrowsException() {
        // Arrange
        parentDTO.setDob(LocalDate.now().plusDays(1)); // Future date

        // Act & Assert
        assertThrows(InvalidDateException.class, () -> parentService.createParent(parentDTO));
        verify(userRepository, never()).save(any(User.class));
        verify(parentRepository, never()).save(any(Parent.class));
    }

    /**
     * ⚠️ Trường hợp biên (Boundary Case)
     * Mô tả: Tạo parent với ngày sinh là ngày hôm qua (gần nhất trong quá khứ).
     * Kỳ vọng: Tạo thành công, trả về ParentDTO hợp lệ.
     */
    @Test
    public void testCreateParent_Boundary_PastDob() {
        // Arrange
        parentDTO.setDob(LocalDate.now().minusDays(1)); // Yesterday
        when(userRepository.findByEmail(parentDTO.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(parentRepository.save(any(Parent.class))).thenReturn(parent);
        when(parentMapper.toParentDTO(any(Parent.class))).thenReturn(parentDTO);

        // Act
        ParentDTO result = parentService.createParent(parentDTO);

        // Assert
        assertNotNull(result);
        assertEquals(parentDTO.getEmail(), result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
        verify(parentRepository, times(1)).save(any(Parent.class));
    }

    /**
     * ✅ Trường hợp bình thường (Normal Case)
     * Mô tả: Lấy thông tin parent thành công với ID hợp lệ.
     * Kỳ vọng: Trả về ParentDTO tương ứng với parent được tìm thấy.
     */
    @Test
    public void testGetParentById_Success() {
        // Arrange
        when(parentRepository.findParentById(1)).thenReturn(parent);
        when(parentMapper.toParentDTO(parent)).thenReturn(parentDTO);

        // Act
        ParentDTO result = parentService.getParentById(1);

        // Assert
        assertNotNull(result);
        assertEquals(parentDTO.getEmail(), result.getEmail());
        verify(parentRepository, times(1)).findParentById(1);
    }

    /**
     * ❌ Trường hợp bất thường (Abnormal Case)
     * Mô tả: Lấy thông tin parent thất bại khi ID không tồn tại.
     * Kỳ vọng: Ném ra UserNotFoundException.
     */
    @Test
    public void testGetParentById_NotFound_ThrowsException() {
        // Arrange
        when(parentRepository.findParentById(1)).thenReturn(null);

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> parentService.getParentById(1));
        verify(parentRepository, times(1)).findParentById(1);
    }

    /**
     * ✅ Trường hợp bình thường (Normal Case)
     * Mô tả: Đổi mật khẩu thành công khi mật khẩu cũ đúng.
     * Kỳ vọng: Mật khẩu được cập nhật và lưu vào cơ sở dữ liệu.
     */
    @Test
    public void testChangePassword_Success() {
        // Arrange
        when(parentRepository.findById(1)).thenReturn(Optional.of(parent));
        when(passwordEncoder.matches("oldPassword", user.getPassword())).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(user)).thenReturn(user);

        // Act
        parentService.changePassword(1, "oldPassword", "newPassword");

        // Assert
        verify(userRepository, times(1)).save(user);
        assertEquals("newEncodedPassword", user.getPassword());
    }

    /**
     * ❌ Trường hợp bất thường (Abnormal Case)
     * Mô tả: Đổi mật khẩu thất bại khi mật khẩu cũ không đúng.
     * Kỳ vọng: Ném ra IncorrectPasswordException, không lưu thay đổi.
     */
    @Test
    public void testChangePassword_IncorrectOldPassword_ThrowsException() {
        // Arrange
        when(parentRepository.findById(1)).thenReturn(Optional.of(parent));
        when(passwordEncoder.matches("wrongPassword", user.getPassword())).thenReturn(false);

        // Act & Assert
        assertThrows(IncorrectPasswordException.class, () -> parentService.changePassword(1, "wrongPassword", "newPassword"));
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * ❌ Trường hợp bất thường (Abnormal Case)
     * Mô tả: Đổi mật khẩu thất bại khi parent không tồn tại.
     * Kỳ vọng: Ném ra UserNotFoundException, không lưu thay đổi.
     */
    @Test
    public void testChangePassword_ParentNotFound_ThrowsException() {
        // Arrange
        when(parentRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> parentService.changePassword(1, "oldPassword", "newPassword"));
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * ⚠️ Trường hợp biên (Boundary Case)
     * Mô tả: Đổi mật khẩu với parent ID tối thiểu hợp lệ (1).
     * Kỳ vọng: Mật khẩu được cập nhật thành công.
     */
    @Test
    public void testChangePassword_Boundary_MinValidId() {
        // Arrange
        when(parentRepository.findById(1)).thenReturn(Optional.of(parent));
        when(passwordEncoder.matches("oldPassword", user.getPassword())).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(user)).thenReturn(user);

        // Act
        parentService.changePassword(1, "oldPassword", "newPassword");

        // Assert
        verify(userRepository, times(1)).save(user);
        assertEquals("newEncodedPassword", user.getPassword());
    }
}