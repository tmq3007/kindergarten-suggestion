//package fa.pjb.back.service.impl;
//
//import fa.pjb.back.common.exception.EmailExistException;
//import fa.pjb.back.common.exception.InvalidDateException;
//import fa.pjb.back.common.exception.SchoolNotFoundException;
//import fa.pjb.back.common.exception.UsernameExistException;
//import fa.pjb.back.model.dto.SchoolDTO;
//import fa.pjb.back.model.dto.SchoolOwnerDTO;
//import fa.pjb.back.model.entity.School;
//import fa.pjb.back.model.entity.SchoolOwner;
//import fa.pjb.back.model.entity.User;
//import fa.pjb.back.model.enums.ERole;
//import fa.pjb.back.model.mapper.SOMapper;
//import fa.pjb.back.repository.SchoolOwnerRepository;
//import fa.pjb.back.repository.SchoolRepository;
//import fa.pjb.back.repository.UserRepository;
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
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class SchoolOwnerServiceImplTest {
//
//    @Mock
//    private SchoolOwnerRepository schoolOwnerRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private SchoolRepository schoolRepository;
//
//    @Mock
//    private EmailService emailService;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @Mock
//    private SOMapper soMapper;
//
//    @InjectMocks
//    private SchoolOwnerServiceImpl schoolOwnerService;
//
//    private SchoolOwnerDTO schoolOwnerDTO;
//    private User user;
//    private School school;
//    private SchoolOwner schoolOwner;
//
//    @BeforeEach
//    public void setUp() {
//        schoolOwnerDTO = new SchoolOwnerDTO();
//        schoolOwnerDTO.setEmail("owner@example.com");
//        schoolOwnerDTO.setFullName("John Doe");
//        schoolOwnerDTO.setPhone("1234567890");
//        schoolOwnerDTO.setDob(LocalDate.of(1990, 1, 1));
//        schoolOwnerDTO.setStatus(true);
//
//        user = User.builder()
//                .id(1)
//                .email("owner@example.com")
//                .username("JohnD1")
//                .password("encodedPassword")
//                .role(ERole.ROLE_SCHOOL_OWNER)
//                .phone("1234567890")
//                .fullname("John Doe")
//                .status(true)
//                .dob(LocalDate.of(1990, 1, 1))
//                .build();
//
//        school = new School();
//        school.setId(1);
//        school.setName("Test School");
//
//        schoolOwner = new SchoolOwner();
//        schoolOwner.setId(1);
//        schoolOwner.setUser(user);
//        schoolOwner.setSchool(school);
//    }
//
//    /**
//     * ✅ Trường hợp bình thường (Normal Case)
//     * Mô tả: Tạo school owner thành công với dữ liệu hợp lệ, không có trường học.
//     * Kỳ vọng: Trả về SchoolOwnerDTO đã tạo, gọi các phương thức lưu và gửi email đúng một lần.
//     */
//    @Test
//    public void testCreateSchoolOwner_Success_NoSchool() {
//        // Arrange
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//         when(passwordEncoder.encode(anyString())).thenReturn("encodedUsername");
//        when(userRepository.save(any(User.class))).thenReturn(user);
//        when(schoolOwnerRepository.save(any(SchoolOwner.class))).thenReturn(schoolOwner);
//        when(soMapper.toSchoolOwner(any(SchoolOwner.class))).thenReturn(schoolOwnerDTO);
//
//        // Act
//        SchoolOwnerDTO result = schoolOwnerService.createSchoolOwner(schoolOwnerDTO);
//
//        // Assert
//        assertNotNull(result);
//        assertEquals(schoolOwnerDTO.getEmail(), result.getEmail());
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(schoolOwnerRepository, times(1)).save(any(SchoolOwner.class));
//        verify(emailService, times(1)).sendUsernamePassword(anyString(), anyString(), anyString(), anyString());
//        verify(schoolRepository, never()).findById(anyInt());
//    }
//
//    /**
//     * ✅ Trường hợp bình thường (Normal Case)
//     * Mô tả: Tạo school owner thành công với dữ liệu hợp lệ và trường học tồn tại.
//     * Kỳ vọng: Trả về SchoolOwnerDTO đã tạo, liên kết với trường học.
//     */
//    @Test
//    public void testCreateSchoolOwner_Success_WithSchool() {
//        // Arrange
//        SchoolDTO schoolDTO = new SchoolDTO();
//        schoolDTO.setId(1);
//        schoolOwnerDTO.setSchool(schoolDTO);
//
//        // Ensure fullName is not null to avoid null username generation
//        schoolOwnerDTO.setFullName("John Doe");
//
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//        // Stub both anyString() and null cases to cover all possibilities
//        when(userRepository.findByUsername(null)).thenReturn(Optional.empty());
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedUsername");
//        when(userRepository.save(any(User.class))).thenReturn(user);
//        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
//        when(schoolOwnerRepository.save(any(SchoolOwner.class))).thenReturn(schoolOwner);
//        when(soMapper.toSchoolOwner(any(SchoolOwner.class))).thenReturn(schoolOwnerDTO);
//
//        // Act
//        SchoolOwnerDTO result = schoolOwnerService.createSchoolOwner(schoolOwnerDTO);
//
//        // Assert
//        assertNotNull(result);
//        assertEquals(schoolOwnerDTO.getEmail(), result.getEmail());
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(schoolRepository, times(1)).findById(1);
//        verify(schoolOwnerRepository, times(1)).save(any(SchoolOwner.class));
//        verify(emailService, times(1)).sendUsernamePassword(anyString(), anyString(), anyString(), anyString());
//    }
//
//    /**
//     * ❌ Trường hợp bất thường (Abnormal Case)
//     * Mô tả: Tạo school owner thất bại khi email đã tồn tại.
//     * Kỳ vọng: Ném ra EmailExistException, không gọi phương thức lưu.
//     */
//    @Test
//    public void testCreateSchoolOwner_EmailExists_ThrowsException() {
//        // Arrange
//        when(userRepository.findByEmail(schoolOwnerDTO.getEmail())).thenReturn(Optional.of(user));
//
//        // Act & Assert
//        assertThrows(EmailExistException.class, () -> schoolOwnerService.createSchoolOwner(schoolOwnerDTO));
//        verify(userRepository, never()).save(any(User.class));
//        verify(schoolOwnerRepository, never()).save(any(SchoolOwner.class));
//    }
//
//
//
//    /**
//     * ❌ Trường hợp bất thường (Abnormal Case)
//     * Mô tả: Tạo school owner thất bại khi ngày sinh không hợp lệ (tương lai).
//     * Kỳ vọng: Ném ra InvalidDateException, không gọi phương thức lưu.
//     */
//    @Test
//    public void testCreateSchoolOwner_InvalidDob_ThrowsException() {
//        // Arrange
//        schoolOwnerDTO.setDob(LocalDate.now().plusDays(1)); // Future date
//
//        // Act & Assert
//        assertThrows(InvalidDateException.class, () -> schoolOwnerService.createSchoolOwner(schoolOwnerDTO));
//        verify(userRepository, never()).save(any(User.class));
//        verify(schoolOwnerRepository, never()).save(any(SchoolOwner.class));
//    }
//
//    /**
//     * ❌ Trường hợp bất thường (Abnormal Case)
//     * Mô tả: Tạo school owner thất bại khi trường học không tồn tại.
//     * Kỳ vọng: Ném ra SchoolNotFoundException, không lưu SchoolOwner.
//     */
//    @Test
//    public void testCreateSchoolOwner_SchoolNotFound_ThrowsException() {
//        // Arrange
//        SchoolDTO schoolDTO = new SchoolDTO();
//        schoolDTO.setId(999); // Non-existent school ID
//        schoolOwnerDTO.setSchool(schoolDTO);
//
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedUsername");
//        when(userRepository.save(any(User.class))).thenReturn(user);
//        when(schoolRepository.findById(999)).thenReturn(Optional.empty());
//
//        // Act & Assert
//        assertThrows(SchoolNotFoundException.class, () -> schoolOwnerService.createSchoolOwner(schoolOwnerDTO));
//        verify(userRepository, times(1)).save(any(User.class)); // User saved before school check
//        verify(schoolOwnerRepository, never()).save(any(SchoolOwner.class));
//    }
//
//    /**
//     * ⚠️ Trường hợp biên (Boundary Case)
//     * Mô tả: Tạo school owner với ngày sinh gần nhất trong quá khứ (hôm qua).
//     * Kỳ vọng: Tạo thành công, trả về SchoolOwnerDTO hợp lệ.
//     */
//    @Test
//    public void testCreateSchoolOwner_Boundary_PastDob() {
//        // Arrange
//        schoolOwnerDTO.setDob(LocalDate.now().minusDays(1)); // Yesterday
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedUsername");
//        when(userRepository.save(any(User.class))).thenReturn(user);
//        when(schoolOwnerRepository.save(any(SchoolOwner.class))).thenReturn(schoolOwner);
//        when(soMapper.toSchoolOwner(any(SchoolOwner.class))).thenReturn(schoolOwnerDTO);
//
//        // Act
//        SchoolOwnerDTO result = schoolOwnerService.createSchoolOwner(schoolOwnerDTO);
//
//        // Assert
//        assertNotNull(result);
//        assertEquals(schoolOwnerDTO.getEmail(), result.getEmail());
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(schoolOwnerRepository, times(1)).save(any(SchoolOwner.class));
//    }
//
//    /**
//     * ⚠️ Trường hợp biên (Boundary Case)
//     * Mô tả: Tạo school owner với tên chỉ có hai từ (tối thiểu hợp lệ).
//     * Kỳ vọng: Tạo thành công, trả về SchoolOwnerDTO hợp lệ.
//     */
//    @Test
//    public void testCreateSchoolOwner_Boundary_MinValidName() {
//        // Arrange
//        schoolOwnerDTO.setFullName("Jane Doe"); // Minimum valid name with two words
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedUsername");
//        when(userRepository.save(any(User.class))).thenReturn(user);
//        when(schoolOwnerRepository.save(any(SchoolOwner.class))).thenReturn(schoolOwner);
//        when(soMapper.toSchoolOwner(any(SchoolOwner.class))).thenReturn(schoolOwnerDTO);
//
//        // Act
//        SchoolOwnerDTO result = schoolOwnerService.createSchoolOwner(schoolOwnerDTO);
//
//        // Assert
//        assertNotNull(result);
//        assertEquals(schoolOwnerDTO.getEmail(), result.getEmail());
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(schoolOwnerRepository, times(1)).save(any(SchoolOwner.class));
//    }
//}