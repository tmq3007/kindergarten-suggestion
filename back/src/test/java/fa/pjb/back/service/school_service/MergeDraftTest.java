package fa.pjb.back.service.school_service;

import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.repository.MediaRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.GCPFileStorageService;
import fa.pjb.back.service.impl.SchoolServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    private GCPFileStorageService imageService;

    @InjectMocks
    private SchoolServiceImpl schoolService;

    private School draftSchool;
    private School originSchool;
    private List<Media> oldMedias;
    private Set<SchoolOwner> schoolOwners;
    private List<Media> draftImages;

    @BeforeEach
    void setUp() {
        originSchool = School.builder()
                .id(1)
                .name("Original School")
                .images(new ArrayList<>())
                .facilities(new HashSet<>())
                .utilities(new HashSet<>())
                .schoolOwners(new HashSet<>())
                .build();

        draftImages = List.of(
                Media.builder()
                        .id(2)
                        .cloudId("new-cloud-id")
                        .build()
        );

        draftSchool = School.builder()
                .id(2)
                .name("Updated School Name")
                .originalSchool(originSchool)
                .images(draftImages)
                .facilities(Set.of(Facility.builder().fid(1).name("Lab").build()))
                .utilities(Set.of(Utility.builder().uid(1).name("Wifi").build()))
                .schoolOwners(new HashSet<>())
                .build();

        oldMedias = List.of(
                Media.builder()
                        .id(1)
                        .cloudId("old-cloud-id")
                        .build()
        );

        schoolOwners = new HashSet<>(Arrays.asList(
                SchoolOwner.builder().id(1).build(),
                SchoolOwner.builder().id(null).build()
        ));

        draftSchool.setSchoolOwners(schoolOwners);
    }

    @Test
    void mergeDraft_SuccessfulMerge_ReturnsTrue() {
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolOwnerRepository.findBySchoolIdAndDraftId(anyInt(), anyInt())).thenReturn(new HashSet<>());
        when(schoolOwnerRepository.findAllByDraft(draftSchool)).thenReturn(new ArrayList<>());
        when(schoolRepository.save(any())).thenReturn(originSchool);
        when(schoolRepository.saveAndFlush(any())).thenReturn(originSchool);
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder().status(200).message("Deleted").fileId("old-cloud-id").build()
        );

        Boolean result = schoolService.mergeDraft(2);

        assertTrue(result);
        assertEquals("Updated School Name", originSchool.getName());
        assertNull(originSchool.getDraft());
        verify(schoolRepository).delete(draftSchool);
        verify(mediaRepository).deleteAll(oldMedias);
    }

    @Test
    void mergeDraft_DraftNotFound_ReturnsFalse() {
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(null);

        Boolean result = schoolService.mergeDraft(2);

        assertFalse(result);
        verify(schoolRepository, never()).saveAndFlush(any());
    }

    @Test
    void mergeDraft_OriginalSchoolNotFound_ReturnsFalse() {
        draftSchool.setOriginalSchool(null);
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);

        Boolean result = schoolService.mergeDraft(2);

        assertFalse(result);
        verify(schoolRepository, never()).saveAndFlush(any());
    }

    @Test
    void mergeDraft_ErrorCopyingProperties_ReturnsFalse() {
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        doThrow(new RuntimeException("Copy error")).when(schoolRepository).save(any());
        Boolean result = schoolService.mergeDraft(2);
        assertFalse(result);
    }

    @Test
    void mergeDraft_ErrorDeletingOldImages_ReturnsFalse() {
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolOwnerRepository.findBySchoolIdAndDraftId(anyInt(), anyInt())).thenReturn(new HashSet<>());
        when(schoolOwnerRepository.findAllByDraft(draftSchool)).thenReturn(new ArrayList<>());
        when(schoolRepository.save(any())).thenReturn(originSchool);
        when(schoolRepository.saveAndFlush(any())).thenReturn(originSchool);

        when(imageService.deleteUploadedImage(anyString()))
                .thenThrow(new RuntimeException("Cloud delete failed"));

        Boolean result = schoolService.mergeDraft(2);

        assertFalse(result);
        verify(mediaRepository, never()).deleteAll(any());
    }


    @Test
    void mergeDraft_WithFacilitiesAndUtilities_CopiesCorrectly() {
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolOwnerRepository.findBySchoolIdAndDraftId(anyInt(), anyInt())).thenReturn(new HashSet<>());
        when(schoolOwnerRepository.findAllByDraft(draftSchool)).thenReturn(new ArrayList<>());
        when(schoolRepository.save(any())).thenReturn(originSchool);
        when(schoolRepository.saveAndFlush(any())).thenReturn(originSchool);
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder().status(200).message("Deleted").build()
        );

        Boolean result = schoolService.mergeDraft(2);

        assertTrue(result);
        assertEquals(1, originSchool.getFacilities().size());
        assertEquals(1, originSchool.getUtilities().size());
    }

    @Test
    void mergeDraft_WithTransientSchoolOwners_SavesThem() {
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolOwnerRepository.findBySchoolIdAndDraftId(anyInt(), anyInt())).thenReturn(schoolOwners);
        when(schoolOwnerRepository.findAllByDraft(draftSchool)).thenReturn(new ArrayList<>());
        when(schoolOwnerRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(schoolRepository.save(any())).thenReturn(originSchool);
        when(schoolRepository.saveAndFlush(any())).thenReturn(originSchool);
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder().status(200).message("Deleted").build()
        );

        Boolean result = schoolService.mergeDraft(2);

        assertTrue(result);
        verify(schoolOwnerRepository, atLeastOnce()).save(any(SchoolOwner.class));
        assertEquals(2, originSchool.getSchoolOwners().size());
    }

    @Test
    void mergeDraft_WithImages_UpdatesSchoolReference() {
        when(schoolRepository.findByIdWithDraft(2)).thenReturn(draftSchool);
        when(mediaRepository.getAllBySchool(originSchool)).thenReturn(oldMedias);
        when(schoolOwnerRepository.findBySchoolIdAndDraftId(anyInt(), anyInt())).thenReturn(new HashSet<>());
        when(schoolOwnerRepository.findAllByDraft(draftSchool)).thenReturn(new ArrayList<>());
        when(schoolRepository.save(any())).thenReturn(originSchool);
        when(schoolRepository.saveAndFlush(any())).thenReturn(originSchool);
        when(mediaRepository.save(any())).thenAnswer(i -> {
            Media media = i.getArgument(0);
            media.setSchool(originSchool);
            return media;
        });
        when(imageService.deleteUploadedImage(anyString())).thenReturn(
                FileUploadVO.builder().status(200).message("Deleted").build()
        );

        Boolean result = schoolService.mergeDraft(2);

        assertTrue(result);
        assertEquals(originSchool, draftImages.get(0).getSchool());
        assertEquals(1, originSchool.getImages().size());
    }
}
