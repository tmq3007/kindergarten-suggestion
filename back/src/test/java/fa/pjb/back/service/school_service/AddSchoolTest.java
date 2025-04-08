package fa.pjb.back.service.school_service;

import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.common.exception._14xx_data.UploadFileException;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.enums.EFileFolder;
import fa.pjb.back.model.enums.ESchoolStatus;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.SchoolOwnerVO;
import fa.pjb.back.repository.*;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.GCPFileStorageService;
import fa.pjb.back.service.impl.SchoolServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddSchoolTest {

    @InjectMocks
    private SchoolServiceImpl schoolService;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private UtilityRepository utilityRepository;

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private SchoolMapper schoolMapper;

    @Mock
    private EmailService emailService;

    @Mock
    private GCPFileStorageService imageService;

    @Mock
    private User user;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private MultipartFile multipartFile;

    @BeforeEach
    void setUp() {
        // Mock SecurityContextHolder
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);

        // Default mock behavior for checkEmailExists
        lenient().when(schoolRepository.existsByEmail(anyString())).thenReturn(false);
    }

    // Normal Case: Admin user, all valid, with images
    @Test
    void testAddSchool_NormalCase_AdminUser_WithImages() throws IOException {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, Set.of(1, 2), Set.of(1, 2), Set.of(1, 2), "Description"
        );

        List<MultipartFile> images = List.of(multipartFile);

        when(user.getRole()).thenReturn(ERole.ROLE_ADMIN);
        School school = getSchool();
        when(schoolMapper.toSchool(dto)).thenReturn(school);
        School savedSchool = getSavedSchool();
        when(schoolRepository.save(school)).thenReturn(savedSchool);

        Set<Facility> facilities = Set.of(new Facility(), new Facility());
        Set<Utility> utilities = Set.of(new Utility(), new Utility());
        Set<SchoolOwner> schoolOwners = Set.of(new SchoolOwner(), new SchoolOwner());
        when(facilityRepository.findAllByFidIn(dto.facilities())).thenReturn(facilities);
        when(utilityRepository.findAllByUidIn(dto.utilities())).thenReturn(utilities);
        when(schoolOwnerRepository.findAllByIdIn(dto.schoolOwners())).thenReturn(schoolOwners);

        when(multipartFile.getSize()).thenReturn(1024L); // 1KB, under 5MB
        List<File> files = List.of(new File("test.jpeg"));
        byte[] validJpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}; // JPEG SOI marker
        when(multipartFile.getBytes()).thenReturn(validJpegBytes);
        when(imageService.convertMultiPartFileToFile(images)).thenReturn(files);
        List<FileUploadVO> imageVOs = List.of(new FileUploadVO(200, "image.jpeg", (long) 1024, "filename", "fileId", "url"));
        when(imageService.uploadListFiles(eq(files), contains("School_1Image_"), eq(EFileFolder.SCHOOL_IMAGES), any()))
                .thenReturn(imageVOs);

        SchoolDetailVO schoolDetailVO = new SchoolDetailVO(
                1, ESchoolStatus.APPROVED.getValue(), "Test School", (byte) 1, "District 1", "Ward 1", "Hanoi",
                "Street 1", "test@example.com", "+84123456789", (byte) 1, (byte) 1, 1000, 2000, "http://test.com",
                "Description", null, null, null, Date.from(LocalDate.now().atStartOfDay().toInstant(java.time.ZoneOffset.UTC))
                , null,
                Set.of(new SchoolOwnerVO(1, 1, "test", "test", "test", "test", "test", null, LocalDate.now()))
        );
        when(schoolMapper.toSchoolDetailVO(savedSchool)).thenReturn(schoolDetailVO);

        SchoolDetailVO result = schoolService.addSchool(dto, images);

        assertEquals(schoolDetailVO, result);
        assertEquals(LocalDate.now(), school.getPostedDate());
        assertEquals(facilities, school.getFacilities());
        assertEquals(utilities, school.getUtilities());
        assertEquals(schoolOwners, school.getSchoolOwners());
        assertEquals(ESchoolStatus.APPROVED.getValue(), school.getStatus());

        ArgumentCaptor<List<Media>> mediaCaptor = ArgumentCaptor.forClass(List.class);
        verify(mediaRepository).saveAll(mediaCaptor.capture());
        List<Media> savedMedia = mediaCaptor.getValue();
        assertEquals(1, savedMedia.size());
        assertEquals("url", savedMedia.get(0).getUrl());
        assertEquals(savedSchool, savedMedia.get(0).getSchool());

        verify(emailService, never()).sendSubmitEmailToAllAdmin(anyString(), anyString(), anyString());
    }

    private static School getSchool() {
        School school = new School();
        school.setName("Test School");
        school.setSchoolType((byte) 1);
        school.setDistrict("District 1");
        school.setWard("Ward 1");
        school.setProvince("Hanoi");
        school.setStreet("Street 1");
        school.setEmail("test@example.com");
        school.setPhone("+84123456789");
        school.setReceivingAge((byte) 1);
        school.setEducationMethod((byte) 1);
        school.setFeeFrom(1000);
        school.setFeeTo(2000);
        school.setWebsite("http://test.com");
        school.setDescription("Description");
        return school;
    }

    private static School getSavedSchool() {
        School savedSchool = new School();
        savedSchool.setId(1);
        savedSchool.setName("Test School");
        savedSchool.setSchoolType((byte) 1);
        savedSchool.setDistrict("District 1");
        savedSchool.setWard("Ward 1");
        savedSchool.setProvince("Hanoi");
        savedSchool.setStreet("Street 1");
        savedSchool.setEmail("test@example.com");
        savedSchool.setPhone("+84123456789");
        savedSchool.setReceivingAge((byte) 1);
        savedSchool.setEducationMethod((byte) 1);
        savedSchool.setFeeFrom(1000);
        savedSchool.setFeeTo(2000);
        savedSchool.setWebsite("http://test.com");
        savedSchool.setDescription("Description");
        return savedSchool;
    }

    // Normal Case: Non-admin user, all valid, status SAVED, no images
    @Test
    void testAddSchool_NormalCase_NonAdminUser_SavedStatus_NoImages() {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SAVED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, Set.of(1, 2), Set.of(1, 2), Set.of(1, 2), "Description"
        );

        when(user.getRole()).thenReturn(ERole.ROLE_SCHOOL_OWNER);
        School school = getSchool();
        when(schoolMapper.toSchool(dto)).thenReturn(school);
        School savedSchool = getSavedSchool();
        savedSchool.setStatus(ESchoolStatus.SAVED.getValue());
        when(schoolRepository.save(school)).thenReturn(savedSchool);

        Set<Facility> facilities = Set.of(new Facility(), new Facility());
        Set<Utility> utilities = Set.of(new Utility(), new Utility());
        Set<SchoolOwner> schoolOwners = Set.of(new SchoolOwner(), new SchoolOwner());
        when(facilityRepository.findAllByFidIn(dto.facilities())).thenReturn(facilities);
        when(utilityRepository.findAllByUidIn(dto.utilities())).thenReturn(utilities);
        when(schoolOwnerRepository.findAllByIdIn(dto.schoolOwners())).thenReturn(schoolOwners);

        SchoolDetailVO schoolDetailVO = new SchoolDetailVO(
                1, ESchoolStatus.SAVED.getValue(), "Test School", (byte) 1, "District 1", "Ward 1", "Hanoi",
                "Street 1", "test@example.com", "+84123456789", (byte) 1, (byte) 1, 1000, 2000, "http://test.com",
                "Description", null, null, null, Date.from(LocalDate.now().atStartOfDay().toInstant(java.time.ZoneOffset.UTC)),
                null,Set.of(new SchoolOwnerVO(1, 1, "test", "test", "test", "test", "test", null, LocalDate.now()))
        );
        when(schoolMapper.toSchoolDetailVO(savedSchool)).thenReturn(schoolDetailVO);

        SchoolDetailVO result = schoolService.addSchool(dto, null);

        assertEquals(schoolDetailVO, result);
        assertEquals(1, result.id());
        assertEquals(ESchoolStatus.SAVED.getValue(), result.status());
        assertEquals("Test School", result.name());
        assertEquals((byte) 1, result.schoolType());
        assertEquals("District 1", result.district());
        assertEquals("Ward 1", result.ward());
        assertEquals("Hanoi", result.province());
        assertEquals("Street 1", result.street());
        assertEquals("test@example.com", result.email());
        assertEquals("+84123456789", result.phone());
        assertEquals((byte) 1, result.receivingAge());
        assertEquals((byte) 1, result.educationMethod());
        assertEquals(1000, result.feeFrom());
        assertEquals(2000, result.feeTo());
        assertEquals("http://test.com", result.website());
        assertEquals("Description", result.description());
        assertEquals(LocalDate.now(), school.getPostedDate());
        assertEquals(facilities, school.getFacilities());
        assertEquals(utilities, school.getUtilities());
        assertEquals(schoolOwners, school.getSchoolOwners());
        verify(emailService, never()).sendSubmitEmailToAllAdmin(
                "Test School", "testuser", "http://localhost:3000/admin/management/school/school-detail/1"
        );
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Normal Case: Non-admin user, all valid, no images
    @Test
    void testAddSchool_NormalCase_NonAdminUser_NoImages() {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, Set.of(1, 2), Set.of(1, 2), Set.of(1, 2), "Description"
        );

        when(user.getRole()).thenReturn(ERole.ROLE_SCHOOL_OWNER);
        when(user.getUsername()).thenReturn("testuser");
        School school = getSchool();
        when(schoolMapper.toSchool(dto)).thenReturn(school);
        School savedSchool = getSavedSchool();
        savedSchool.setStatus(ESchoolStatus.SUBMITTED.getValue());
        when(schoolRepository.save(school)).thenReturn(savedSchool);

        Set<Facility> facilities = Set.of(new Facility(), new Facility());
        Set<Utility> utilities = Set.of(new Utility(), new Utility());
        Set<SchoolOwner> schoolOwners = Set.of(new SchoolOwner(), new SchoolOwner());
        when(facilityRepository.findAllByFidIn(dto.facilities())).thenReturn(facilities);
        when(utilityRepository.findAllByUidIn(dto.utilities())).thenReturn(utilities);
        when(schoolOwnerRepository.findAllByIdIn(dto.schoolOwners())).thenReturn(schoolOwners);

        SchoolDetailVO schoolDetailVO = new SchoolDetailVO(
                1, ESchoolStatus.SUBMITTED.getValue(), "Test School", (byte) 1, "District 1", "Ward 1", "Hanoi",
                "Street 1", "test@example.com", "+84123456789", (byte) 1, (byte) 1, 1000, 2000, "http://test.com",
                "Description", null, null, null, Date.from(LocalDate.now().atStartOfDay().toInstant(java.time.ZoneOffset.UTC)),
                null,Set.of(new SchoolOwnerVO(1, 1, "test", "test", "test", "test", "test", null, LocalDate.now()))

        );
        when(schoolMapper.toSchoolDetailVO(savedSchool)).thenReturn(schoolDetailVO);

        SchoolDetailVO result = schoolService.addSchool(dto, null);

        assertEquals(schoolDetailVO, result);
        assertEquals(1, result.id());
        assertEquals(ESchoolStatus.SUBMITTED.getValue(), result.status());
        assertEquals("Test School", result.name());
        assertEquals((byte) 1, result.schoolType());
        assertEquals("District 1", result.district());
        assertEquals("Ward 1", result.ward());
        assertEquals("Hanoi", result.province());
        assertEquals("Street 1", result.street());
        assertEquals("test@example.com", result.email());
        assertEquals("+84123456789", result.phone());
        assertEquals((byte) 1, result.receivingAge());
        assertEquals((byte) 1, result.educationMethod());
        assertEquals(1000, result.feeFrom());
        assertEquals(2000, result.feeTo());
        assertEquals("http://test.com", result.website());
        assertEquals("Description", result.description());
        assertEquals(LocalDate.now(), school.getPostedDate());
        assertEquals(facilities, school.getFacilities());
        assertEquals(utilities, school.getUtilities());
        assertEquals(schoolOwners, school.getSchoolOwners());
        verify(emailService).sendSubmitEmailToAllAdmin(
                "Test School", "testuser", "http://localhost:3000/admin/management/school/school-detail/1"
        );
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Normal Case: Null facilities, utilities, and images
    @Test
    void testAddSchool_NormalCase_NullCollectionsAndImages() {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, null, null, null, "Description"
        );

        when(user.getRole()).thenReturn(ERole.ROLE_SCHOOL_OWNER);
        when(user.getUsername()).thenReturn("testuser");
        School school = getSchool();
        school.setStatus(ESchoolStatus.SUBMITTED.getValue());
        when(schoolMapper.toSchool(dto)).thenReturn(school);
        School savedSchool = getSavedSchool();
        savedSchool.setStatus(ESchoolStatus.SUBMITTED.getValue());
        when(schoolRepository.save(school)).thenReturn(savedSchool);

        SchoolDetailVO schoolDetailVO = new SchoolDetailVO(
                1, ESchoolStatus.SUBMITTED.getValue(), "Test School", (byte) 1, "District 1", "Ward 1", "Hanoi",
                "Street 1", "test@example.com", "+84123456789", (byte) 1, (byte) 1, 1000, 2000, "http://test.com",
                "Description", null, null, null, Date.from(LocalDate.now().atStartOfDay().toInstant(java.time.ZoneOffset.UTC)),
                null,Set.of(new SchoolOwnerVO(1, 1, "test", "test", "test", "test", "test", null, LocalDate.now()))

        );
        when(schoolMapper.toSchoolDetailVO(savedSchool)).thenReturn(schoolDetailVO);

        SchoolDetailVO result = schoolService.addSchool(dto, null);

        assertEquals(schoolDetailVO, result);
        assertEquals(LocalDate.now(), school.getPostedDate());
        assertNull(school.getFacilities());
        assertNull(school.getUtilities());
        assertEquals(new HashSet<>(), school.getSchoolOwners());
        assertEquals(ESchoolStatus.SUBMITTED.getValue(), school.getStatus());
        verify(emailService).sendSubmitEmailToAllAdmin(
                "Test School", "testuser", "http://localhost:3000/admin/management/school/school-detail/1"
        );
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Normal Case: Empty collections and images list
    @Test
    void testAddSchool_NormalCase_EmptyCollectionsAndImages() {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, Set.of(), Set.of(), Set.of(), "Description"
        );

        when(user.getRole()).thenReturn(ERole.ROLE_SCHOOL_OWNER);
        when(user.getUsername()).thenReturn("testuser");
        School school = getSchool();
        school.setStatus(ESchoolStatus.SUBMITTED.getValue());
        when(schoolMapper.toSchool(dto)).thenReturn(school);
        School savedSchool = getSavedSchool();
        savedSchool.setStatus(ESchoolStatus.SUBMITTED.getValue());
        when(schoolRepository.save(school)).thenReturn(savedSchool);

        when(facilityRepository.findAllByFidIn(dto.facilities())).thenReturn(Set.of());
        when(utilityRepository.findAllByUidIn(dto.utilities())).thenReturn(Set.of());

        SchoolDetailVO schoolDetailVO = new SchoolDetailVO(
                1, ESchoolStatus.SUBMITTED.getValue(), "Test School", (byte) 1, "District 1", "Ward 1", "Hanoi",
                "Street 1", "test@example.com", "+84123456789", (byte) 1, (byte) 1, 1000, 2000, "http://test.com",
                "Description", null, null, null, Date.from(LocalDate.now().atStartOfDay().toInstant(java.time.ZoneOffset.UTC)),
                null,Set.of(new SchoolOwnerVO(1, 1, "test", "test", "test", "test", "test", null, LocalDate.now()))
        );
        when(schoolMapper.toSchoolDetailVO(savedSchool)).thenReturn(schoolDetailVO);

        SchoolDetailVO result = schoolService.addSchool(dto, Collections.emptyList());

        assertEquals(schoolDetailVO, result);
        assertEquals(LocalDate.now(), school.getPostedDate());
        assertEquals(Set.of(), school.getFacilities());
        assertEquals(Set.of(), school.getUtilities());
        assertEquals(Set.of(), school.getSchoolOwners());
        assertEquals(ESchoolStatus.SUBMITTED.getValue(), school.getStatus());
        verify(emailService).sendSubmitEmailToAllAdmin(
                "Test School", "testuser", "http://localhost:3000/admin/management/school/school-detail/1"
        );
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Abnormal Case: Email already exists
    @Test
    void testAddSchool_AbnormalCase_EmailExists() {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, null, null, null, "Description"
        );

        when(schoolRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistedException.class, () -> schoolService.addSchool(dto, null));
        verify(schoolMapper, never()).toSchool(any());
        verify(schoolRepository, never()).save(any());
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Abnormal Case: Invalid collections
    @Test
    void testAddSchool_AbnormalCase_InvalidFacilities() {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, Set.of(1, 2, 3), Set.of(1, 2, 3), Set.of(1, 2, 3), "Description"
        );

        // Mock the School object
        School school = mock(School.class);
        when(schoolMapper.toSchool(dto)).thenReturn(school);

        // Mock the facility repository to return fewer facilities than requested
        Set<Facility> facilities = Set.of(new Facility(), new Facility()); // Only 2 instead of 3
        when(facilityRepository.findAllByFidIn(dto.facilities())).thenReturn(facilities);

        // Execute and assert the exception
        assertThrows(InvalidDataException.class, () -> schoolService.addSchool(dto, null));

        // Verify interactions
        verify(schoolMapper).toSchool(dto);
        verify(school).setPostedDate(any());
        verify(schoolRepository, never()).save(any());
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Abnormal Case: Authentication failure
    @Test
    void testAddSchool_AbnormalCase_AuthenticationFailed() {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, null, null, null, "Description"
        );

        when(authentication.getPrincipal()).thenReturn("not_a_user");

        assertThrows(AuthenticationFailedException.class, () -> schoolService.addSchool(dto, null));
        verify(schoolRepository, never()).existsByEmail(any());
        verify(schoolMapper, never()).toSchool(any());
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Abnormal Case: Image file too large
    @Test
    void testAddSchool_AbnormalCase_ImageFileTooLarge() throws IOException {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, null, null, null, "Description"
        );

        List<MultipartFile> images = List.of(multipartFile);

        when(user.getRole()).thenReturn(ERole.ROLE_SCHOOL_OWNER);
        School school = new School();
        when(schoolMapper.toSchool(dto)).thenReturn(school);
        School savedSchool = new School();
        savedSchool.setId(1);
        when(schoolRepository.save(school)).thenReturn(savedSchool);

        when(multipartFile.getSize()).thenReturn(6 * 1024 * 1024L); // 6MB, exceeds 5MB limit

        assertThrows(InvalidFileFormatException.class, () -> schoolService.addSchool(dto, images));
        verify(schoolRepository).save(school);
        verify(mediaRepository, never()).saveAll(any());
        verify(emailService, never()).sendSubmitEmailToAllAdmin("Test School", "testuser", "http://localhost:3000/admin/management/school/school-detail/1");
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Abnormal Case: Invalid image file type
    @Test
    void testAddSchool_AbnormalCase_InvalidImageType() throws IOException {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, null, null, null, "Description"
        );

        List<MultipartFile> images = List.of(multipartFile);

        when(user.getRole()).thenReturn(ERole.ROLE_SCHOOL_OWNER);
        School school = new School();
        when(schoolMapper.toSchool(dto)).thenReturn(school);
        School savedSchool = new School();
        savedSchool.setId(1);
        when(schoolRepository.save(school)).thenReturn(savedSchool);

        when(multipartFile.getSize()).thenReturn(1024L); // 1KB, under 5MB
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3}); // Mock bytes
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf"); // Invalid type

        assertThrows(InvalidFileFormatException.class, () -> schoolService.addSchool(dto, images));
        verify(schoolRepository).save(school);
        verify(emailService, never()).sendSubmitEmailToAllAdmin("Test School", "testuser", "http://localhost:3000/admin/management/school/school-detail/1");
        verify(mediaRepository, never()).saveAll(any());
        verify(imageService, never()).uploadListFiles(any(), any(), any(), any());
    }

    // Abnormal Case: Image upload fails
    @Test
    void testAddSchool_AbnormalCase_ImageUploadFails() throws IOException {
        SchoolDTO dto = new SchoolDTO(
                1, "Test School", 1, "http://test.com", ESchoolStatus.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, null, null, null, "Description"
        );

        List<MultipartFile> images = List.of(multipartFile);

        when(user.getRole()).thenReturn(ERole.ROLE_SCHOOL_OWNER);
        School school = new School();
        when(schoolMapper.toSchool(dto)).thenReturn(school);
        School savedSchool = new School();
        savedSchool.setId(1);
        when(schoolRepository.save(school)).thenReturn(savedSchool);

        // Mock file properties to pass size and MIME type check
        when(multipartFile.getSize()).thenReturn(1024L); // 1KB, under 5MB
        // Use realistic JPEG bytes to pass Tika's MIME check
        byte[] validJpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}; // JPEG SOI marker
        when(multipartFile.getBytes()).thenReturn(validJpegBytes);

        List<File> files = List.of(new File("test.jpg"));
        when(imageService.convertMultiPartFileToFile(images)).thenReturn(files);
        when(imageService.uploadListFiles(eq(files), contains("School_1Image_"), eq(EFileFolder.SCHOOL_IMAGES), any()))
                .thenThrow(new UploadFileException("Error while uploading images"));

        assertThrows(UploadFileException.class, () -> schoolService.addSchool(dto, images));
        verify(schoolRepository).save(school);
        verify(imageService).uploadListFiles(eq(files), contains("School_1Image_"), eq(EFileFolder.SCHOOL_IMAGES), any());
        verify(mediaRepository, never()).saveAll(any());
    }
}