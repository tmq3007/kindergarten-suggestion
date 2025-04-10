package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._13xx_school.StatusNotExistException;
import fa.pjb.back.event.model.SchoolPublishedEvent;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Collections;
import java.util.Optional;

import static fa.pjb.back.model.enums.ESchoolStatus.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UpdateSchoolStatusBySchoolOwnerTest {

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private UserService userService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private SchoolServiceImpl schoolService;

    private User schoolOwnerUser;
    private School school;
    private SchoolOwner schoolOwner;
    private ChangeSchoolStatusDTO dto;

    @BeforeEach
    void setUp() {
        schoolOwnerUser = new User();
        schoolOwnerUser.setId(1);
        schoolOwnerUser.setUsername("owner");
        schoolOwnerUser.setRole(ERole.ROLE_SCHOOL_OWNER);

        school = new School();
        school.setId(1);
        school.setEmail("school@example.com");
        school.setName("Test School");

        schoolOwner = new SchoolOwner();
        schoolOwner.setId(1);
        schoolOwner.setSchool(school);
        schoolOwner.setPublicPermission(true);

        dto = new ChangeSchoolStatusDTO(1, (byte) 4, null);
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_Published_Success() {
        school.setStatus(APPROVED.getValue());
        when(userService.getCurrentUser()).thenReturn(schoolOwnerUser);
        when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        schoolService.updateSchoolStatusBySchoolOwner(dto);

        assertEquals(PUBLISHED.getValue(), school.getStatus());
        verify(eventPublisher).publishEvent(any(SchoolPublishedEvent.class));
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_Published_NoPermission() {
        schoolOwner.setPublicPermission(false);
        school.setStatus(APPROVED.getValue());
        when(userService.getCurrentUser()).thenReturn(schoolOwnerUser);
        when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        assertThrows(AuthenticationFailedException.class, () -> schoolService.updateSchoolStatusBySchoolOwner(dto));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_Unpublished_Success() {
        dto = new ChangeSchoolStatusDTO(1, (byte) 5, null);
        school.setStatus(PUBLISHED.getValue());
        when(userService.getCurrentUser()).thenReturn(schoolOwnerUser);
        when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        schoolService.updateSchoolStatusBySchoolOwner(dto);

        assertEquals(UNPUBLISHED.getValue(), school.getStatus());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_Deleted_Success() {
        dto = new ChangeSchoolStatusDTO(1, (byte) 6, null);
        school.setStatus(SAVED.getValue());
        when(userService.getCurrentUser()).thenReturn(schoolOwnerUser);
        when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
        when(schoolOwnerRepository.findAllBySchoolId(1)).thenReturn(Collections.singletonList(schoolOwner));

        schoolService.updateSchoolStatusBySchoolOwner(dto);

        assertEquals(DELETED.getValue(), school.getStatus());
        assertNull(schoolOwner.getSchool());
        verify(schoolOwnerRepository).saveAndFlush(schoolOwner);
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_InvalidStatus() {
        dto = new ChangeSchoolStatusDTO(1, (byte) 99, null);
        when(userService.getCurrentUser()).thenReturn(schoolOwnerUser);
        when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        assertThrows(StatusNotExistException.class, () -> schoolService.updateSchoolStatusBySchoolOwner(dto));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_SchoolNotFound() {
        when(userService.getCurrentUser()).thenReturn(schoolOwnerUser);
        when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
        when(schoolRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(SchoolNotFoundException.class, () -> schoolService.updateSchoolStatusBySchoolOwner(dto));
        verify(eventPublisher, never()).publishEvent(any());
    }
}