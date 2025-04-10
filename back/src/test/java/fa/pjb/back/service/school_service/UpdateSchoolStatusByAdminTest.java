package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.InappropriateSchoolStatusException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._13xx_school.StatusNotExistException;
import fa.pjb.back.event.model.SchoolApprovedEvent;
import fa.pjb.back.event.model.SchoolDeletedEvent;
import fa.pjb.back.event.model.SchoolPublishedEvent;
import fa.pjb.back.event.model.SchoolRejectedEvent;
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
class UpdateSchoolStatusByAdminTest {

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

    private User adminUser;
    private School school;
    private ChangeSchoolStatusDTO dto;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1);
        adminUser.setUsername("admin");
        adminUser.setRole(ERole.ROLE_ADMIN);

        school = new School();
        school.setId(1);
        school.setEmail("school@example.com");
        school.setName("Test School");

        dto = new ChangeSchoolStatusDTO(1, (byte) 2, "Response");
    }

    @Test
    void testUpdateSchoolStatusByAdmin_Approved_Success() {
        school.setStatus(SUBMITTED.getValue());
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
        when(userService.getCurrentUser()).thenReturn(adminUser);

        schoolService.updateSchoolStatusByAdmin(dto);

        assertEquals(APPROVED.getValue(), school.getStatus());
        verify(eventPublisher).publishEvent(any(SchoolApprovedEvent.class));
        verify(schoolRepository, never()).save(any(School.class)); // Không cần save vì không có flush
    }

    @Test
    void testUpdateSchoolStatusByAdmin_Approved_InvalidStatus() {
        school.setStatus(SAVED.getValue());
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
        when(userService.getCurrentUser()).thenReturn(adminUser);

        assertThrows(InappropriateSchoolStatusException.class, () -> schoolService.updateSchoolStatusByAdmin(dto));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void testUpdateSchoolStatusByAdmin_Rejected_Success() {
        dto = new ChangeSchoolStatusDTO(1, (byte) 3, "Rejected reason");
        school.setStatus(SUBMITTED.getValue());
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
        when(userService.getCurrentUser()).thenReturn(adminUser);

        schoolService.updateSchoolStatusByAdmin(dto);

        assertEquals(REJECTED.getValue(), school.getStatus());
        verify(eventPublisher).publishEvent(any(SchoolRejectedEvent.class));
    }

    @Test
    void testUpdateSchoolStatusByAdmin_Published_Success() {
        dto = new ChangeSchoolStatusDTO(1, (byte) 4, null);
        school.setStatus(APPROVED.getValue());
        SchoolOwner owner = new SchoolOwner();
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
        when(schoolOwnerRepository.findAllBySchoolId(1)).thenReturn(Collections.singletonList(owner));
        when(userService.getCurrentUser()).thenReturn(adminUser);

        schoolService.updateSchoolStatusByAdmin(dto);

        assertEquals(PUBLISHED.getValue(), school.getStatus());
        assertTrue(owner.getPublicPermission());
        verify(eventPublisher).publishEvent(any(SchoolPublishedEvent.class));
        verify(schoolOwnerRepository).saveAndFlush(owner);
    }

    @Test
    void testUpdateSchoolStatusByAdmin_Deleted_Success() {
        dto = new ChangeSchoolStatusDTO(1, (byte) 6, "Deleted reason");
        SchoolOwner owner = new SchoolOwner();
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
        when(schoolOwnerRepository.findAllBySchoolId(1)).thenReturn(Collections.singletonList(owner));
        when(userService.getCurrentUser()).thenReturn(adminUser);

        schoolService.updateSchoolStatusByAdmin(dto);

        assertEquals(DELETED.getValue(), school.getStatus());
        assertNull(owner.getSchool());
        verify(eventPublisher).publishEvent(any(SchoolDeletedEvent.class));
        verify(schoolOwnerRepository).saveAndFlush(owner);
    }

    @Test
    void testUpdateSchoolStatusByAdmin_SchoolNotFound() {
        when(schoolRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(SchoolNotFoundException.class, () -> schoolService.updateSchoolStatusByAdmin(dto));
        verify(eventPublisher, never()).publishEvent(any());
    }
}