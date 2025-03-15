package fa.pjb.back.service.school_service;

import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.StatusNotExistException;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.impl.EmailServiceImpl;
import fa.pjb.back.service.impl.SchoolServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UpdateSchoolStatusBySchoolOwner {
    @InjectMocks
    private SchoolServiceImpl schoolService; // Giả định đây là class chứa phương thức updateSchoolStatusBySchoolOwner

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private EmailServiceImpl emailService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private User mockUser;

    @BeforeEach
    void setUp() {
        // Thiết lập mock cho SecurityContextHolder
        mockUser = new User();
        mockUser.setId(1);
        mockUser.setUsername("schoolOwner");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_NormalCase_Published() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status((byte) 4)
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 2); // Approved
        school.setEmail("school@example.com");
        school.setName("Test School");

        SchoolOwner owner = new SchoolOwner();
        owner.setUser(mockUser);
        owner.setSchool(school);
        owner.setPublicPermission(true);

        when(schoolOwnerRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(owner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act
        schoolService.updateSchoolStatusBySchoolOwner(dto);

        // Assert
        verify(schoolRepository).findById(1);
        assert school.getStatus() == 4; // Published
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_AbnormalCase_InvalidStatus() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status((byte) 7) // Status không hợp lệ
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 2); // Approved

        SchoolOwner owner = new SchoolOwner();
        owner.setUser(mockUser);
        owner.setSchool(school);
        owner.setPublicPermission(true);

        when(schoolOwnerRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(owner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act & Assert
        assertThrows(StatusNotExistException.class, () -> schoolService.updateSchoolStatusBySchoolOwner(dto));
        verify(schoolRepository).findById(1);
        verifyNoInteractions(emailService);
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_BoundaryCase_NoPublicPermission() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status((byte) 4) // Published
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 2); // Approved

        SchoolOwner owner = new SchoolOwner();
        owner.setUser(mockUser);
        owner.setSchool(school);
        owner.setPublicPermission(false); // Không có quyền

        when(schoolOwnerRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(owner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act & Assert
        assertThrows(AuthenticationFailedException.class, () -> schoolService.updateSchoolStatusBySchoolOwner(dto));
        verify(schoolRepository).findById(1);
        verifyNoInteractions(emailService);
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_BoundaryCase_UnpublishedFromPublished() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status((byte) 5) // Unpublished
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 4); // Published

        SchoolOwner owner = new SchoolOwner();
        owner.setUser(mockUser);
        owner.setSchool(school);
        owner.setPublicPermission(true);

        when(schoolOwnerRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(owner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act
        schoolService.updateSchoolStatusBySchoolOwner(dto);

        // Assert
        verify(schoolRepository).findById(1);
        assert school.getStatus() == 5; // Unpublished
        verifyNoInteractions(emailService);
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_BoundaryCase_DeletedFromUnpublished() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status((byte) 6) // Deleted
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 5); // Unpublished

        SchoolOwner owner = new SchoolOwner();
        owner.setUser(mockUser);
        owner.setSchool(school);
        owner.setPublicPermission(true);

        when(schoolOwnerRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(owner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act
        schoolService.updateSchoolStatusBySchoolOwner(dto);

        // Assert
        verify(schoolRepository).findById(1);
        assert school.getStatus() == 6; // Deleted
        verifyNoInteractions(emailService);
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_BoundaryCase_StatusMinValue() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status(Byte.MIN_VALUE) // -128
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 2); // Approved

        SchoolOwner owner = new SchoolOwner();
        owner.setUser(mockUser);
        owner.setSchool(school);
        owner.setPublicPermission(true);

        when(schoolOwnerRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(owner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act & Assert
        assertThrows(StatusNotExistException.class, () -> schoolService.updateSchoolStatusBySchoolOwner(dto));
        verify(schoolRepository).findById(1);
        verifyNoInteractions(emailService);
    }

    @Test
    void testUpdateSchoolStatusBySchoolOwner_BoundaryCase_StatusMaxValue() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status(Byte.MAX_VALUE) // 127
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 2); // Approved

        SchoolOwner owner = new SchoolOwner();
        owner.setUser(mockUser);
        owner.setSchool(school);
        owner.setPublicPermission(true);

        when(schoolOwnerRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(owner));
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act & Assert
        assertThrows(StatusNotExistException.class, () -> schoolService.updateSchoolStatusBySchoolOwner(dto));
        verify(schoolRepository).findById(1);
        verifyNoInteractions(emailService);
    }
}
