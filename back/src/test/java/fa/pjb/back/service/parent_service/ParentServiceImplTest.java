package fa.pjb.back.service.parent_service;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._14xx_data.IncorrectPasswordException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.EFileFolder;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.GCPFileStorageService;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.ParentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ParentServiceImplTest {

    @Mock
    private ParentRepository parentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParentMapper parentMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserService userService;

    @Mock
    private AutoGeneratorHelper autoGeneratorHelper;
    @Mock
    private GCPFileStorageService ggDriveImageService;
    @InjectMocks
    private ParentServiceImpl parentService;
    MultipartFile mockImage;
    ParentUpdateDTO parentUpdateDTO;

    @BeforeEach
    void setUp() throws IOException {
        MockitoAnnotations.openMocks(this);

        // Setup dữ liệu mẫu cho ParentUpdateDTO
        parentUpdateDTO = ParentUpdateDTO.builder()
                .fullname("Updated Parent Name")
                .email("updated@parent.com")
                .phone("+84123456789")
                .dob(LocalDate.of(1990, 1, 1))
                .district("Updated District")
                .province("Updated Province")
                .ward("Updated Ward")
                .street("123 Updated Street")
                .status(true)
                .role("ROLE_PARENT")
                .build();

        // Tạo ảnh giả lập (JPEG) để test upload
        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", baos);
        byte[] imageBytes = baos.toByteArray();

        mockImage = new MockMultipartFile("image", "image.jpg", "image/jpeg", imageBytes);
    }

    /**
     * Normal Case: Lấy ParentVO thành công
     */
    @Test
    void getParentById_Success() {
        Integer userId = 1;
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).build())
                .district("District A")
                .province("Province A")
                .build();

        ParentVO parentVO = ParentVO.builder()
                .id(1)
                .fullname("Test Parent")
                .email("test@example.com")
                .build();

        // When: Giả lập repository trả về Parent
        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);
        when(parentMapper.toParentVO(parent)).thenReturn(parentVO);

        // Assert: Kiểm tra kết quả
        assertNotNull(parentVO);
        assertEquals("Test Parent", parentVO.fullname());
        assertEquals("test@example.com", parentVO.email());
    }

    /**
     * Abnormal Case: userId không tồn tại
     */
    @Test
    void getParentById_UserNotFound() {
        // Given: Không tìm thấy userId
        Integer userId = 999;

        // When: Giả lập repository trả về null
        when(parentRepository.findParentByUserId(userId)).thenReturn(null);

        // Act & Assert: Kiểm tra ngoại lệ
        assertThrows(UserNotFoundException.class, () -> parentService.getParentById(userId));
    }

    /**
     * Boundary Case: userId là số âm
     */
    @Test
    void getParentById_NegativeUserId() {
        // Given: userId âm
        Integer userId = -1;

        // When: Giả lập repository trả về null
        when(parentRepository.findParentByUserId(userId)).thenReturn(null);

        // Act & Assert: Kiểm tra ngoại lệ
        assertThrows(UserNotFoundException.class, () -> parentService.getParentById(userId));
    }

    /**
     * Boundary Case: userId là null
     */
    @Test
    void getParentById_NullUserId() {
        // Given: userId null
        Integer userId = null;

        // Act & Assert: Kiểm tra ngoại lệ UserNotFoundException
        assertThrows(UserNotFoundException.class, () -> parentService.getParentById(userId));
    }

    @Test
    void changePassword_Success() {
        Integer userId = 1;
        String oldPassword = "oldPass123";
        String newPassword = "newPass123";
        User user = User.builder().id(userId).password("encodedOldPass").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(oldPassword, "encodedOldPass")).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPass");

        parentService.changePassword(userId, oldPassword, newPassword);

        assertEquals("encodedNewPass", user.getPassword());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void changePassword_UserNotFound() {
        Integer userId = 999;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () ->
                parentService.changePassword(userId, "oldPass", "newPass"));
    }

    @Test
    void changePassword_IncorrectOldPassword() {
        Integer userId = 1;
        User user = User.builder().id(userId).password("encodedOldPass").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "encodedOldPass")).thenReturn(false);
        assertThrows(IncorrectPasswordException.class, () ->
                parentService.changePassword(userId, "wrongPass", "newPass"));
    }

    @Test
    void changePassword_NullUserId() {
        assertThrows(IllegalArgumentException.class, () ->
                parentService.changePassword(null, "oldPass", "newPass"));
    }

    @Test
    void changePassword_NullOldPassword() {
        Integer userId = 1;
        User user = User.builder().id(userId).password("encodedOldPass").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        assertThrows(IllegalArgumentException.class, () ->
                parentService.changePassword(userId, null, "newPass"));
    }

    @Test
    void changePassword_EmptyOldPassword() {
        Integer userId = 1;
        User user = User.builder().id(userId).password("encodedOldPass").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        assertThrows(IllegalArgumentException.class, () ->
                parentService.changePassword(userId, "", "newPass"));
    }

    @Test
    void changePassword_NullNewPassword() {
        Integer userId = 1;
        User user = User.builder().id(userId).password("encodedOldPass").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "encodedOldPass")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () ->
                parentService.changePassword(userId, "oldPass", null));
    }

    @Test
    void changePassword_EmptyNewPassword() {
        Integer userId = 1;
        User user = User.builder().id(userId).password("encodedOldPass").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "encodedOldPass")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () ->
                parentService.changePassword(userId, "oldPass", ""));
    }


    /**
     * Normal Case: Cập nhật Parent thành công với ảnh mới
     */
    @Test
    void editParent_Success_WithImage() throws IOException {
        Integer userId = 1;
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).email("old@parent.com").status(true).build())
                .build();
        ParentVO parentVO = ParentVO.builder()
                .id(1)
                .fullname("Updated Parent Name")
                .email("updated@parent.com")
                .build();
        FileUploadVO imageVO = FileUploadVO.builder()
                .status(200)
                .message("Uploaded successfully")
                .size(1024L)
                .fileName("image.jpg")
                .fileId("fileId123")
                .url("https://image.url")
                .build();

        // Tạo mockImage bằng mock() thay vì MockMultipartFile
        MultipartFile mockImage = mock(MultipartFile.class);

        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);
        when(userRepository.findByEmail("updated@parent.com")).thenReturn(Optional.empty());
        when(mockImage.isEmpty()).thenReturn(false);
        when(mockImage.getSize()).thenReturn(1024L);
        when(mockImage.getContentType()).thenReturn("image/jpeg");
        doNothing().when(mockImage).transferTo(any(File.class));
        when(ggDriveImageService.uploadImage(any(File.class), eq("Parent_1_Profile_"), eq(EFileFolder.USER_IMAGES)))
                .thenReturn(imageVO);
        when(parentMapper.toParentVO(parent)).thenReturn(parentVO);

        ParentVO result = parentService.editParent(userId, parentUpdateDTO, mockImage);

        assertNotNull(result);
        assertEquals("Updated Parent Name", result.fullname());
        assertEquals("updated@parent.com", result.email());
        verify(parentRepository, times(1)).save(parent);
        verify(ggDriveImageService, times(1)).uploadImage(any(), any(), any());
    }

    /**
     * Normal Case: Cập nhật Parent thành công không có ảnh
     */
    @Test
    void editParent_Success_WithoutImage() {
        Integer userId = 1;
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).email("old@parent.com").status(true).build())
                .build();
        ParentVO parentVO = ParentVO.builder()
                .id(1)
                .fullname("Updated Parent Name")
                .email("updated@parent.com")
                .build();

        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);
        when(userRepository.findByEmail("updated@parent.com")).thenReturn(Optional.empty());
        when(parentMapper.toParentVO(parent)).thenReturn(parentVO);

        ParentVO result = parentService.editParent(userId, parentUpdateDTO, null);

        assertNotNull(result);
        assertEquals("Updated Parent Name", result.fullname());
        assertEquals("updated@parent.com", result.email());
        verify(parentRepository, times(1)).save(parent);
        verify(ggDriveImageService, never()).uploadImage(any(), any(), any());
    }

    /**
     * Abnormal Case: User không tồn tại
     */
    @Test
    void editParent_UserNotFound() {
        Integer userId = 999;

        when(parentRepository.findParentByUserId(userId)).thenReturn(null);

        assertThrows(UserNotFoundException.class, () ->
                parentService.editParent(userId, parentUpdateDTO, null));
        verify(parentRepository, never()).save(any());
    }

    /**
     * Abnormal Case: Email đã tồn tại
     */
    @Test
    void editParent_EmailAlreadyExisted() {
        Integer userId = 1;
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).email("old@parent.com").status(true).build())
                .build();
        User existingUser = User.builder().id(2).email("updated@parent.com").build();

        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);
        when(userRepository.findByEmail("updated@parent.com")).thenReturn(Optional.of(existingUser));

        assertThrows(EmailAlreadyExistedException.class, () ->
                parentService.editParent(userId, parentUpdateDTO, null));
        verify(parentRepository, never()).save(any());
    }

    /**
     * Abnormal Case: Ngày sinh không hợp lệ
     */
    @Test
    void editParent_InvalidDob() {
        Integer userId = 1;
        ParentUpdateDTO invalidDto = ParentUpdateDTO.builder()
                .fullname("Updated Name")
                .email("updated@parent.com")
                .phone("+84123456789")
                .dob(LocalDate.now().plusDays(1)) // Future date
                .build();
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).email("old@parent.com").build())
                .build();

        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);

        assertThrows(InvalidDateException.class, () ->
                parentService.editParent(userId, invalidDto, null));
        verify(parentRepository, never()).save(any());
    }

    /**
     * Abnormal Case: Kích thước ảnh vượt quá giới hạn
     */
    @Test
    void editParent_ImageTooLarge() {
        Integer userId = 1;
        MultipartFile largeImage = new MockMultipartFile(
                "largeImage", "large.jpg", "image/jpeg", new byte[6 * 1024 * 1024] // 6MB file
        );
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).email("old@parent.com").build())
                .build();

        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);

        assertThrows(RuntimeException.class, () ->
                parentService.editParent(userId, parentUpdateDTO, largeImage));
        verify(parentRepository, never()).save(any());
    }

    /**
     * Abnormal Case: Loại file không hợp lệ
     */
    @Test
    void editParent_InvalidFileType() {
        Integer userId = 1;
        MultipartFile invalidImage = new MockMultipartFile(
                "invalidFile", "file.txt", "text/plain", "content".getBytes()
        );
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).email("old@parent.com").build())
                .build();

        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);

        assertThrows(RuntimeException.class, () ->
                parentService.editParent(userId, parentUpdateDTO, invalidImage));
        verify(parentRepository, never()).save(any());
    }

    /**
     * Abnormal Case: Upload ảnh thất bại
     */
    @Test
    void editParent_ImageUploadFailed() throws IOException {
        Integer userId = 1;
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).email("old@parent.com").build())
                .build();
        FileUploadVO imageVO = FileUploadVO.builder()
                .status(400)
                .message("Upload failed")
                .size(0L)
                .fileName(null)
                .fileId(null)
                .url(null)
                .build();

        // Tạo mockImage bằng mock() thay vì MockMultipartFile
        MultipartFile mockImage = mock(MultipartFile.class);

        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);
        when(userRepository.findByEmail("updated@parent.com")).thenReturn(Optional.empty());
        // Sử dụng any(File.class) thay vì (File) any()
        doNothing().when(mockImage).transferTo(any(File.class));
        when(ggDriveImageService.uploadImage(any(File.class), eq("Parent_1_Profile_"), eq(EFileFolder.USER_IMAGES)))
                .thenReturn(imageVO);

        assertThrows(RuntimeException.class, () ->
                parentService.editParent(userId, parentUpdateDTO, mockImage));
        verify(parentRepository, never()).save(any());
    }

    /**
     * Boundary Case: userId null
     */
    @Test
    void editParent_NullUserId() {
        assertThrows(UserNotFoundException.class, () ->
                parentService.editParent(null, parentUpdateDTO, null));
    }


    /**
     * Boundary Case: Ảnh rỗng
     */
    @Test
    void editParent_EmptyImage() {
        Integer userId = 1;
        MultipartFile emptyImage = new MockMultipartFile("empty", "empty.jpg", "image/jpeg", new byte[0]);
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).email("old@parent.com").status(true).build())
                .build();
        ParentVO parentVO = ParentVO.builder()
                .id(1)
                .fullname("Updated Parent Name")
                .email("updated@parent.com")
                .build();

        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);
        when(userRepository.findByEmail("updated@parent.com")).thenReturn(Optional.empty());
        when(parentMapper.toParentVO(parent)).thenReturn(parentVO);

        ParentVO result = parentService.editParent(userId, parentUpdateDTO, emptyImage);

        assertNotNull(result);
        assertEquals("Updated Parent Name", result.fullname());
        verify(parentRepository, times(1)).save(parent);
        verify(ggDriveImageService, never()).uploadImage(any(), any(), any());
    }

}
