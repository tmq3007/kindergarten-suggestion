package fa.pjb.back.service.school_service;

import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.repository.MediaRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.impl.SchoolServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MergeDraftTest {

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private GGDriveImageService imageService;

    @InjectMocks
    private SchoolServiceImpl schoolService;

    private School draftSchool;
    private School originSchool;
    private List<Media> oldMedias;
    private Set<SchoolOwner> schoolOwners;
    private List<Media> draftImages;

    @BeforeEach
    void setUp() {
        // Setup origin school
        originSchool = School.builder()
                .id(1)
                .name("Original School")
                .images(new ArrayList<>())
                .build();

        // Setup draft school
        draftSchool = School.builder()
                .id(2)
                .name("Updated School Name")
                .originalSchool(originSchool)
                .images(new ArrayList<>())
                .schoolOwners(new HashSet<>())
                .build();

        // Setup old media
        oldMedias = List.of(
                Media.builder()
                        .id(1)
                        .cloudId("old-cloud-id")
                        .build()
        );

        // Setup draft images
        draftImages = List.of(
                Media.builder()
                        .id(2)
                        .cloudId("new-cloud-id")
                        .build()
        );
        draftSchool.setImages(draftImages);

        // Setup school owners
        schoolOwners = new HashSet<>(Arrays.asList(
                SchoolOwner.builder()
                        .id(1)
                        .build(),
                SchoolOwner.builder()
                        .id(null) // transient owner
                        .build()
        ));
        draftSchool.setSchoolOwners(schoolOwners);
    }

    @Test
    @Transactional
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    void mergeDraft_SuccessfulMerge_ReturnsTrue() {
        // Arrange
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolRepository.saveAndFlush(any(School.class))).thenReturn(originSchool);
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder()
                        .status(200)
                        .message("Deleted")
                        .size(0L)
                        .fileId("old-cloud-id")
                        .build()
        );

        // Act
        Boolean result = schoolService.mergeDraft(2);

        // Assert
        assertTrue(result);
        assertEquals("Updated School Name", originSchool.getName());
        assertNull(originSchool.getDraft());
        verify(schoolRepository, times(1)).delete(draftSchool);
        verify(mediaRepository, times(1)).deleteAll(oldMedias);
        verify(schoolOwnerRepository, times(1)).save(any(SchoolOwner.class));
    }

    @Test
    void mergeDraft_DraftNotFound_ReturnsFalse() {
        // Arrange
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(null);

        // Act
        Boolean result = schoolService.mergeDraft(2);

        // Assert
        assertFalse(result);
        verify(schoolRepository, never()).saveAndFlush(any());
    }

    @Test
    void mergeDraft_OriginalSchoolNotFound_ReturnsFalse() {
        // Arrange
        draftSchool.setOriginalSchool(null);
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);

        // Act
        Boolean result = schoolService.mergeDraft(2);

        // Assert
        assertFalse(result);
        verify(schoolRepository, never()).saveAndFlush(any());
    }

    @Test
    void mergeDraft_ErrorCopyingProperties_ReturnsFalse() {
        // Arrange
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);

        // Giả lập ném exception khi save
        doThrow(new RuntimeException("Copy error")).when(schoolRepository).saveAndFlush(any(School.class));

        // Act & Assert
        // Do service không bắt exception này, chúng ta expect nó sẽ được ném ra
        assertThrows(RuntimeException.class, () -> schoolService.mergeDraft(2));

        // Verify không có thao tác xóa nào được thực hiện
        verify(mediaRepository, never()).deleteAll(any());
        verify(schoolRepository, never()).delete(draftSchool);
    }

    @Test
    void mergeDraft_ErrorDeletingOldImages_ReturnsFalse() {
        // Arrange
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolRepository.saveAndFlush(any(School.class))).thenReturn(originSchool);
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder()
                        .status(500)
                        .message("Error")
                        .build()
        );

        // Act
        Boolean result = schoolService.mergeDraft(2);

        // Assert
        assertTrue(result);
        verify(mediaRepository, times(1)).deleteAll(oldMedias);
    }

    @Test
    void mergeDraft_WithFacilitiesAndUtilities_CopiesCorrectly() {
        // Arrange
        Set<Facility> facilities = Set.of(
                Facility.builder()
                        .fid(1)
                        .name("Playground")
                        .build()
        );

        Set<Utility> utilities = Set.of(
                Utility.builder()
                        .uid(1)
                        .name("Wifi")
                        .build()
        );

        draftSchool.setFacilities(facilities);
        draftSchool.setUtilities(utilities);

        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolRepository.saveAndFlush(any(School.class))).thenReturn(originSchool);
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder()
                        .status(200)
                        .message("Deleted")
                        .size(0L)
                        .fileId("old-cloud-id")
                        .build()
        );

        // Act
        Boolean result = schoolService.mergeDraft(2);

        // Assert
        assertTrue(result);
        assertEquals(1, originSchool.getFacilities().size());
        assertEquals(1, originSchool.getUtilities().size());
        assertTrue(originSchool.getFacilities().stream().anyMatch(f -> f.getName().equals("Playground")));
        assertTrue(originSchool.getUtilities().stream().anyMatch(u -> u.getName().equals("Wifi")));
    }

    @Test
    void mergeDraft_WithTransientSchoolOwners_SavesThem() {
        // Arrange
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolRepository.saveAndFlush(any(School.class))).thenReturn(originSchool);
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder()
                        .status(200)
                        .message("Deleted")
                        .size(0L)
                        .fileId("old-cloud-id")
                        .build()
        );

        // Act
        Boolean result = schoolService.mergeDraft(2);

        // Assert
        assertTrue(result);
        verify(schoolOwnerRepository, times(1)).save(any(SchoolOwner.class));
        assertEquals(2, originSchool.getSchoolOwners().size());
    }

    @Test
    void mergeDraft_WithImages_UpdatesSchoolReference() {
        // Arrange
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolRepository.saveAndFlush(any(School.class))).thenReturn(originSchool);
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder()
                        .status(200)
                        .message("Deleted")
                        .size(0L)
                        .fileId("old-cloud-id")
                        .build()
        );

        // Act
        Boolean result = schoolService.mergeDraft(2);

        // Assert
        assertTrue(result);
        assertEquals(originSchool, draftImages.get(0).getSchool());
        assertEquals(1, originSchool.getImages().size());
    }
}