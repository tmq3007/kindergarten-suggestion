package fa.pjb.back.service.parent_service;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.enums.EParentInSchool;
import fa.pjb.back.repository.ParentInSchoolRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.ParentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ContextConfiguration
@EnableMethodSecurity(prePostEnabled = true) // Enable security annotations
public class EnrollParentTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParentInSchoolRepository parentInSchoolRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private ParentServiceImpl parentService; // Changed to implementation class

    @Test
    @WithMockUser(roles = "SCHOOL_OWNER")
    void enrollParent_Success() {
        // Setup test data
        Integer userId = 1;
        User user = new User();
        Parent parent = new Parent();
        user.setParent(parent);

        SchoolOwner schoolOwner = new SchoolOwner();
        School school = new School();
        schoolOwner.setSchool(school);

        // Mock repository behavior
        when(userRepository.findByIdWithParent(userId)).thenReturn(Optional.of(user));
        when(userService.getCurrentSchoolOwner()).thenReturn(schoolOwner);
        when(parentInSchoolRepository.save(any(ParentInSchool.class))).thenReturn(new ParentInSchool());

        // Execute
        Boolean result = parentService.enrollParent(userId);

        // Verify
        assertTrue(result);
        verify(userRepository).findByIdWithParent(userId);
        verify(userService).getCurrentSchoolOwner();
        verify(parentInSchoolRepository).save(any(ParentInSchool.class));
    }

    @Test
    @WithMockUser(roles = "SCHOOL_OWNER")
    void enrollParent_UserNotFound() {
        Integer userId = 999;

        when(userRepository.findByIdWithParent(userId)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> {
            parentService.enrollParent(userId);
        });

        verify(userRepository).findByIdWithParent(userId);
        verifyNoInteractions(parentInSchoolRepository);
    }

    @Test
    @WithMockUser(roles = "SCHOOL_OWNER")
    void enrollParent_NoParentProfile() {
        Integer userId = 1;
        User user = new User(); // User without parent profile
        user.setParent(null);

        when(userRepository.findByIdWithParent(userId)).thenReturn(Optional.of(user));

        Boolean result = parentService.enrollParent(userId);

        assertFalse(result);
        verify(userRepository).findByIdWithParent(userId);
        verifyNoInteractions(parentInSchoolRepository);
    }

    @Test
    @WithMockUser(roles = "SCHOOL_OWNER")
    void enrollParent_VerifyParentInSchoolCreation() {
        Integer userId = 1;
        User user = new User();
        Parent parent = new Parent();
        user.setParent(parent);

        SchoolOwner schoolOwner = new SchoolOwner();
        School school = new School();
        school.setId(100);
        schoolOwner.setSchool(school);

        when(userRepository.findByIdWithParent(userId)).thenReturn(Optional.of(user));
        when(userService.getCurrentSchoolOwner()).thenReturn(schoolOwner);

        parentService.enrollParent(userId);

        // Verify the ParentInSchool object creation
        verify(parentInSchoolRepository).save(argThat(pis ->
                pis.getSchool().equals(school) &&
                        pis.getParent().equals(parent) &&
                        pis.getFrom().equals(LocalDate.now()) &&
                        pis.getStatus().equals(EParentInSchool.ACTIVE.getValue())
        ));
    }

}