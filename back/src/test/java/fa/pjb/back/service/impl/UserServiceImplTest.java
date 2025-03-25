package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.BRNAlreadyExistedException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.repository.MediaRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.GGDriveImageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private GGDriveImageService imageService;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AutoGeneratorHelper autoGeneratorHelper;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        reset(userRepository, schoolOwnerRepository, mediaRepository, imageService, emailService, passwordEncoder, autoGeneratorHelper);
    }

    // Normal Case: Create Admin User
    @Test
    void createUser_normalCase_admin_success() {
        UserCreateDTO dto = UserCreateDTO.builder()
                .fullname("John Doe")
                .email("john.doe@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        when(userRepository.findByEmail(dto.email())).thenReturn(Optional.empty());
        when(autoGeneratorHelper.generateUsername(dto.fullname())).thenReturn("johndoe");
        when(autoGeneratorHelper.generateRandomPassword()).thenReturn("randomPass123");
        when(passwordEncoder.encode("randomPass123")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserCreateDTO result = userService.createUser(dto, null);

        assertEquals(dto, result);
        verify(userRepository).save(argThat(user ->
                user.getUsername().equals("johndoe") &&
                        user.getRole() == ERole.ROLE_ADMIN &&
                        user.getEmail().equals("john.doe@example.com")
        ));
        verify(emailService).sendUsernamePassword(dto.email(), dto.fullname(), "johndoe", "randomPass123");
    }

    // Normal Case: Create School Owner with Images
    @Test
    void createUser_normalCase_schoolOwner_withImages_success() throws IOException {
        UserCreateDTO dto = UserCreateDTO.builder()
                .fullname("Jane Doe")
                .email("jane.doe@example.com")
                .role("ROLE_SCHOOL_OWNER")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Test School")
                .business_registration_number("1234567890")
                .build();

        // Use MockMultipartFile to simulate a valid JPEG image
        MultipartFile mockFile = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46} // Minimal JPEG header
        );
        List<MultipartFile> images = List.of(mockFile);
        FileUploadVO fileUploadVO = FileUploadVO.builder()
                .status(200)
                .fileName("test.jpg")
                .url("http://example.com/test.jpg")
                .fileId("file123")
                .size(1024L)
                .build();

        when(userRepository.findByEmail(dto.email())).thenReturn(Optional.empty());
        when(schoolOwnerRepository.existsSchoolOwnerByBusinessRegistrationNumber(dto.business_registration_number())).thenReturn(false);
        when(autoGeneratorHelper.generateUsername(dto.fullname())).thenReturn("janedoe");
        when(autoGeneratorHelper.generateRandomPassword()).thenReturn("randomPass123");
        when(passwordEncoder.encode("randomPass123")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(schoolOwnerRepository.save(any(SchoolOwner.class))).thenAnswer(invocation -> {
            SchoolOwner so = invocation.getArgument(0);
            so.setId(1);
            return so;
        });
        when(imageService.convertMultiPartFileToFile(images)).thenReturn(Collections.singletonList(mock(File.class)));
        when(imageService.uploadListFiles(anyList(), anyString(), any(), any())).thenReturn(List.of(fileUploadVO));
        when(mediaRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        UserCreateDTO result = userService.createUser(dto, images);

        assertEquals(dto, result);
        verify(userRepository).save(argThat(user -> user.getRole() == ERole.ROLE_SCHOOL_OWNER));
        verify(schoolOwnerRepository).save(any(SchoolOwner.class));
        verify(mediaRepository).saveAll(anyList());
        verify(emailService).sendUsernamePassword(dto.email(), dto.fullname(), "janedoe", "randomPass123");
    }

    // Abnormal Case: Email Already Exists
    @Test
    void createUser_abnormalCase_emailExists_failure() {
        UserCreateDTO dto = UserCreateDTO.builder()
                .fullname("John Doe")
                .email("john.doe@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        when(userRepository.findByEmail(dto.email())).thenReturn(Optional.of(new User()));

        assertThrows(EmailAlreadyExistedException.class, () -> userService.createUser(dto, null));
        verify(userRepository, never()).save(any());
    }

    // Abnormal Case: Invalid Date of Birth (Future Date)
    @Test
    void createUser_abnormalCase_invalidDob_failure() {
        UserCreateDTO dto = UserCreateDTO.builder()
                .fullname("John Doe")
                .email("john.doe@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.now().plusDays(1))
                .build();

        when(userRepository.findByEmail(dto.email())).thenReturn(Optional.empty());

        assertThrows(InvalidDateException.class, () -> userService.createUser(dto, null));
        verify(userRepository, never()).save(any());
    }

    // Abnormal Case: Duplicate Business Registration Number
    @Test
    void createUser_abnormalCase_duplicateBRN_failure() {
        UserCreateDTO dto = UserCreateDTO.builder()
                .fullname("Jane Doe")
                .email("jane.doe@example.com")
                .role("ROLE_SCHOOL_OWNER")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .business_registration_number("1234567890")
                .build();

        when(userRepository.findByEmail(dto.email())).thenReturn(Optional.empty());
        when(schoolOwnerRepository.existsSchoolOwnerByBusinessRegistrationNumber(dto.business_registration_number())).thenReturn(true);

        assertThrows(BRNAlreadyExistedException.class, () -> userService.createUser(dto, null));
        verify(userRepository, never()).save(any());
    }

    // Boundary Case: Maximum File Size Exceeded
    @Test
    void createUser_boundaryCase_maxFileSize_failure() throws IOException {
        UserCreateDTO dto = UserCreateDTO.builder()
                .fullname("Jane Doe")
                .email("jane.doe@example.com")
                .role("ROLE_SCHOOL_OWNER")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .business_registration_number("1234567890")
                .build();

        MultipartFile mockFile = mock(MultipartFile.class);
        List<MultipartFile> images = List.of(mockFile);

        when(mockFile.getSize()).thenReturn(5 * 1024 * 1024 + 1L); // Exceeds 5MB
        when(mockFile.getOriginalFilename()).thenReturn("test.jpg");

        assertThrows(InvalidFileFormatException.class, () -> userService.createUser(dto, images));
        verify(userRepository, never()).save(any());
    }

    // Boundary Case: Empty Image List
    @Test
    void createUser_boundaryCase_emptyImageList_success() {
        UserCreateDTO dto = UserCreateDTO.builder()
                .fullname("Jane Doe")
                .email("jane.doe@example.com")
                .role("ROLE_SCHOOL_OWNER")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .business_registration_number("1234567890")
                .build();

        when(userRepository.findByEmail(dto.email())).thenReturn(Optional.empty());
        when(schoolOwnerRepository.existsSchoolOwnerByBusinessRegistrationNumber(dto.business_registration_number())).thenReturn(false);
        when(autoGeneratorHelper.generateUsername(dto.fullname())).thenReturn("janedoe");
        when(autoGeneratorHelper.generateRandomPassword()).thenReturn("randomPass123");
        when(passwordEncoder.encode("randomPass123")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(schoolOwnerRepository.save(any(SchoolOwner.class))).thenAnswer(invocation -> {
            SchoolOwner so = invocation.getArgument(0);
            so.setId(1);
            return so;
        });

        UserCreateDTO result = userService.createUser(dto, Collections.emptyList());

        assertEquals(dto, result);
        verify(userRepository).save(any(User.class));
        verify(schoolOwnerRepository).save(any(SchoolOwner.class));
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }
}