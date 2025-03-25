package fa.pjb.back.service.request_service;

 import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
 import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
 import fa.pjb.back.service.impl.RequestCounsellingReminderServiceImpl;
 import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

 import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class RequestCounsellingReminderServiceImplTest {

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private RequestCounsellingRepository requestCounsellingRepository;

    @InjectMocks
    private RequestCounsellingReminderServiceImpl reminderService;

    private final Integer VALID_USER_ID = 1;
    private final Integer INVALID_USER_ID = -1;
    private final Integer ZERO_USER_ID = 0;

    private SchoolOwner mockSchoolOwner;

    @BeforeEach
    void setUp() {
        // Creating a mock school entity
        School mockSchool = new School();
        mockSchool.setId(100);

        // Initializing the mock SchoolOwner with the mock school
        mockSchoolOwner = SchoolOwner.builder()
                .id(VALID_USER_ID)
                .school(mockSchool)
                .build();
    }

    /** ✅ Normal Case: Overdue requests exist → Should return a reminder */
    @Test
    void checkOverdueForSchoolOwner_ShouldReturnReminder_WhenOverdueRequestsExist() {
        // Simulating finding the SchoolOwner by userId
        when(schoolOwnerRepository.findByUserId(VALID_USER_ID))
                .thenReturn(Optional.of(mockSchoolOwner));

        // Simulating 3 overdue requests
        when(requestCounsellingRepository.countOverdueRequestsBySchoolId(anyInt(), anyByte(), any()))
                .thenReturn(3L);

        // Calling the method under test
        RequestCounsellingReminderVO result = reminderService.checkOverdueForSchoolOwner(VALID_USER_ID);

        // Validating the result
        assertNotNull(result);
        assertEquals("Request Counselling Reminder", result.title());
        assertEquals("You have 3 request counselling that are overdue.", result.description());
    }

    /** ❌ Abnormal Case: SchoolOwner not found → Should throw UserNotFoundException */
    @Test
    void checkOverdueForSchoolOwner_ShouldThrowException_WhenSchoolOwnerNotFound() {
        // Simulating no SchoolOwner found
        when(schoolOwnerRepository.findByUserId(VALID_USER_ID))
                .thenReturn(Optional.empty());

        // Expecting an exception when calling the method
        assertThrows(UserNotFoundException.class,
                () -> reminderService.checkOverdueForSchoolOwner(VALID_USER_ID));

        // Verifying that the repository method to count overdue requests was never called
        verify(requestCounsellingRepository, never()).countOverdueRequestsBySchoolId(anyInt(), anyByte(), any());
    }

    /** ⚠ Boundary Case: No overdue requests → Should return null */
    @Test
    void checkOverdueForSchoolOwner_ShouldReturnNull_WhenNoOverdueRequests() {
        // Simulating finding the SchoolOwner
        when(schoolOwnerRepository.findByUserId(VALID_USER_ID))
                .thenReturn(Optional.of(mockSchoolOwner));

        // Simulating no overdue requests
        when(requestCounsellingRepository.countOverdueRequestsBySchoolId(anyInt(), anyByte(), any()))
                .thenReturn(0L);

        // Calling the method under test
        RequestCounsellingReminderVO result = reminderService.checkOverdueForSchoolOwner(VALID_USER_ID);

        // Expecting a null response
        assertNull(result);
    }

    /** ⚠ Boundary Case: userId = 0 (Invalid case) → Should throw UserNotFoundException */
    @Test
    void checkOverdueForSchoolOwner_ShouldThrowException_WhenUserIdIsZero() {
        assertThrows(UserNotFoundException.class,
                () -> reminderService.checkOverdueForSchoolOwner(ZERO_USER_ID));
    }

    /** ⚠ Boundary Case: userId = -1 (Invalid case) → Should throw UserNotFoundException */
    @Test
    void checkOverdueForSchoolOwner_ShouldThrowException_WhenUserIdIsNegative() {
        assertThrows(UserNotFoundException.class,
                () -> reminderService.checkOverdueForSchoolOwner(INVALID_USER_ID));
    }
}
