package fa.pjb.back.service.school_service;

import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.model.dto.SchoolUpdateDTO;
import fa.pjb.back.model.entity.Facility;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.Utility;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.ImageVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.repository.FacilityRepository;
import fa.pjb.back.repository.MediaRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.repository.UtilityRepository;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.impl.SchoolServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test class for updating school information by an admin.
 */
@ExtendWith(MockitoExtension.class)
class UpdateSchoolByAdminTest {

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private UtilityRepository utilityRepository;

    @Mock
    private GGDriveImageService imageService;

    @Mock
    private SchoolMapper schoolMapper;

    @Mock
    private MediaRepository mediaRepository;

    @InjectMocks
    private SchoolServiceImpl schoolService;

    private SchoolUpdateDTO schoolDTO;
    private School school;
    private List<MultipartFile> mockImages;

    /**
     * Setup method to initialize test data before each test case.
     */
    @BeforeEach
    void setUp() throws IOException {
        schoolDTO = SchoolUpdateDTO.builder()
                .id(1)
                .name("Updated School Name")
                .email("updated@school.com")
                .phone("+84123456789")
                .province("Updated Province")
                .district("Updated District")
                .ward("Updated Ward")
                .street("123 Updated Street")
                .receivingAge((byte) 1)
                .educationMethod((byte) 2)
                .feeFrom(1000)
                .feeTo(2000)
                .facilities(Set.of(1, 2))
                .utilities(Set.of(3, 4))
                .description("Updated description")
                .build();

        school = School.builder()
                .id(1)
                .name("Old School Name")
                .email("old@school.com")
                .facilities(new HashSet<>())
                .utilities(new HashSet<>())
                .build();

        // Create a simple JPEG image for testing
        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", baos);
        byte[] imageBytes = baos.toByteArray();

        mockImages = List.of(
                new MockMultipartFile("image1", "image1.jpg", "image/jpeg", imageBytes),
                new MockMultipartFile("image2", "image2.jpg", "image/jpeg", imageBytes)
        );
    }

    /**
     * Normal Case:
     * Description: Successfully update a school with valid data and images.
     * Expected: Returns updated SchoolDetailVO.
     */
    @Test
    @Transactional
    void updateSchoolByAdmin_Success() throws IOException {
        // Arrange
        Set<Facility> mockFacilities = Set.of(
                Facility.builder().fid(1).name("Library").build(),
                Facility.builder().fid(2).name("Gym").build()
        );

        Set<Utility> mockUtilities = Set.of(
                Utility.builder().uid(3).name("Internet").build(),
                Utility.builder().uid(4).name("Cafeteria").build()
        );

        List<ImageVO> mockImageVOs = List.of(
                ImageVO.builder()
                        .fileName("image1.jpg")
                        .url("https://image1.jpg")
                        .fileId("12345")
                        .size(500L)
                        .status(200)
                        .message("Uploaded successfully")
                        .build(),
                ImageVO.builder()
                        .fileName("image2.jpg")
                        .url("https://image2.jpg")
                        .fileId("67890")
                        .size(600L)
                        .status(200)
                        .message("Uploaded successfully")
                        .build()
        );

        when(schoolRepository.findById(schoolDTO.id())).thenReturn(Optional.of(school));
        when(facilityRepository.findAllByFidIn(schoolDTO.facilities())).thenReturn(mockFacilities);
        when(utilityRepository.findAllByUidIn(schoolDTO.utilities())).thenReturn(mockUtilities);
        when(mediaRepository.getAllBySchool(any(School.class))).thenReturn(Collections.emptyList());
        when(imageService.uploadListImages(any(), any(), any())).thenReturn(mockImageVOs);

        SchoolDetailVO expectedVO = SchoolDetailVO.builder()
                .id(1)
                .name("Updated School Name")
                .district("Updated District")
                .province("Updated Province")
                .email("updated@school.com")
                .phone("+84123456789")
                .feeFrom(1000)
                .feeTo(2000)
                .build();

        when(schoolMapper.toSchoolDetailVO(any(School.class))).thenReturn(expectedVO);

        // Act
        SchoolDetailVO result = schoolService.updateSchoolByAdmin(schoolDTO, new ArrayList<>(mockImages));

        // Assert
        assertNotNull(result);
        assertEquals("Updated School Name", result.name());
        assertEquals("Updated Province", result.province());
        assertEquals("updated@school.com", result.email());

        verify(schoolRepository, times(1)).save(any(School.class));
        verify(imageService, times(1)).uploadListImages(any(), any(), any());
    }

    /**
     * Abnormal Case:
     * Description: Update fails when the school does not exist.
     * Expected: Throws SchoolNotFoundException.
     */
    @Test
    void updateSchoolByAdmin_Fail_SchoolNotFound() {
        // Arrange
        when(schoolRepository.findById(schoolDTO.id())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(SchoolNotFoundException.class, () -> schoolService.updateSchoolByAdmin(schoolDTO, new ArrayList<>(mockImages)));

        verify(schoolRepository, never()).save(any());
    }

    /**
     * Abnormal Case:
     * Description: Update fails when an image exceeds the allowed size.
     * Expected: Throws RuntimeException.
     */
    @Test
    void updateSchoolByAdmin_Fail_InvalidImageSize() {
        // Arrange
        MultipartFile largeImage = new MockMultipartFile(
                "largeImage", "large.jpg", "image/jpeg", new byte[6 * 1024 * 1024] // 6MB file
        );

        List<MultipartFile> oversizedImages = List.of(largeImage);
        when(schoolRepository.findById(schoolDTO.id())).thenReturn(Optional.of(school));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> schoolService.updateSchoolByAdmin(schoolDTO, oversizedImages));

        verify(schoolRepository, never()).save(any());
    }
}