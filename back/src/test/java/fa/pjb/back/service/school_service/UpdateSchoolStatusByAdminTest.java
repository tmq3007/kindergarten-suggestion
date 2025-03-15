package fa.pjb.back.service.school_service;

import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._13xx_school.StatusNotExistException;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.SchoolService;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UpdateSchoolStatusByAdminTest {

    @InjectMocks
    private SchoolServiceImpl schoolService;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private User mockUser;

    @BeforeEach
    void setUp() {
        // Thiết lập mock cho SecurityContextHolder
        mockUser = new User();
        mockUser.setUsername("adminUser");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.setContext(securityContext);
    }

    /**
     * Normal Case:
     * Description: Update a school status successfully with valid data and admin role.
     * Expected: Returns HTTP 200 OK with a response containing the updated school status.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_NormalCase_Approved() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status((byte) 2) // Approved
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 1); // Submitted
        school.setEmail("school@example.com");
        school.setName("Test School");

        String link = "http://localhost:3000/public/school-owner";

        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act
        schoolService.updateSchoolStatusByAdmin(dto);

        // Assert
        verify(schoolRepository).findById(1);
        assert school.getStatus() == 2; // Approved
    }

    /**
     * Abnormal Case:
     * Description: Attempt to update a school status with an invalid status value.
     * Expected: Throws StatusNotExistException as the status does not exist.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_AbnormalCase_InvalidStatus() {
        // Arrange: Create a DTO with an invalid status that does not exist
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status((byte) 7) // Invalid status
                .build();

        // Create a mock school entity with a valid initial status
        School school = new School();
        school.setId(1);
        school.setStatus((byte) 1); // Submitted

        // Mock the repository to return the mock school when queried by ID
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act & Assert: Verify that the service throws a StatusNotExistException
        assertThrows(StatusNotExistException.class, () -> schoolService.updateSchoolStatusByAdmin(dto));

        // Verify interactions
        verify(schoolRepository).findById(1); // Verify the repository was queried
        verifyNoInteractions(emailService); // Ensure no email was sent
    }

    /**
     * Boundary Case:
     * Description: Update the school status from "Approved" to "Published" by an admin.
     * Expected: The school status is updated to "Published" and the owner's public permission is set.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_BoundaryCase_PublishedFromApproved() {
        // Arrange: Set up a DTO for changing the school status to "Published"
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status((byte) 4) // Published
                .build();

        // Create a mock school entity with the current status as "Approved"
        School school = new School();
        school.setId(1);
        school.setStatus((byte) 2); // Approved
        school.setEmail("school@example.com");
        school.setName("Test School");

        // Create a mock school owner with no public permission initially
        SchoolOwner owner = new SchoolOwner();
        owner.setId(1);
        owner.setSchool(school);
        owner.setPublicPermission(false);

        // Mock repository methods to return the mock entities
        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
        when(schoolOwnerRepository.findAllBySchoolId(1)).thenReturn(List.of(owner));

        // Act: Attempt to update the school status using the service
        schoolService.updateSchoolStatusByAdmin(dto);

        // Assert: Verify the interactions and the expected state changes
        verify(schoolRepository).findById(1);
        verify(schoolOwnerRepository).findAllBySchoolId(1);
        verify(schoolOwnerRepository).saveAndFlush(owner);
        assert school.getStatus() == 4; // Published
        assert owner.getPublicPermission(); // Public permission should be true
    }

    /**
     * Boundary Case:
     * Description: Update the school status from "Published" to "Unpublished" by an admin.
     * Expected: The school status is updated to "Unpublished" and the owner's public permission is removed.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_BoundaryCase_UnpublishedFromPublished() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status((byte) 5) // Unpublished
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 4); // Published

        SchoolOwner owner = new SchoolOwner();
        owner.setId(1);
        owner.setSchool(school);
        owner.setPublicPermission(true);

        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));
        when(schoolOwnerRepository.findAllBySchoolId(1)).thenReturn(List.of(owner));

        // Act
        schoolService.updateSchoolStatusByAdmin(dto);

        // Assert
        verify(schoolRepository).findById(1);
        verify(schoolOwnerRepository).findAllBySchoolId(1);
        verify(schoolOwnerRepository).saveAndFlush(owner);
        assert school.getStatus() == 5; // Unpublished
        assert !owner.getPublicPermission(); // Public permission should be false
    }

    /**
     * Boundary Case:
     * Description: Update the school status to the minimum possible value (Byte.MIN_VALUE = -128).
     * Expected: Throws a StatusNotExistException since the status value does not exist.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_BoundaryCase_StatusMinValue() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status(Byte.MIN_VALUE) // -128
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 1); // Submitted

        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act & Assert
        assertThrows(StatusNotExistException.class, () -> schoolService.updateSchoolStatusByAdmin(dto));

        // Verify interactions
        verify(schoolRepository).findById(1);
        verifyNoInteractions(emailService); // Ensure no email was sent
    }

    /**
     * Boundary Case:
     * Description: Update the school status to the maximum possible value (Byte.MAX_VALUE = 127).
     * Expected: Throws a StatusNotExistException since the status value does not exist.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_BoundaryCase_StatusMaxValue() {
        // Arrange
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status(Byte.MAX_VALUE) // 127
                .build();

        School school = new School();
        school.setId(1);
        school.setStatus((byte) 1); // Submitted

        when(schoolRepository.findById(1)).thenReturn(Optional.of(school));

        // Act & Assert
        // Verify that attempting to update the school status to an invalid value
        // (Byte.MAX_VALUE) throws a StatusNotExistException.
        assertThrows(StatusNotExistException.class, () -> schoolService.updateSchoolStatusByAdmin(dto));

        // Verify that the repository was queried by ID, and that the email service
        // was not called (since the status update failed).
        verify(schoolRepository).findById(1);
        verifyNoInteractions(emailService);
    }
}
