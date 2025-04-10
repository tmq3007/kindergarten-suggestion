package fa.pjb.back.service.request_service;

 import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
 import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.School;
 import fa.pjb.back.model.entity.User;
 import fa.pjb.back.model.enums.ERequestCounsellingStatus;
 import fa.pjb.back.model.enums.ERole;
 import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
 import fa.pjb.back.repository.UserRepository;
 import fa.pjb.back.service.EmailService;
 import fa.pjb.back.service.impl.RequestCounsellingReminderServiceImpl;
 import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

 import java.time.LocalDate;
 import java.time.LocalDateTime;
 import java.util.ArrayList;
 import java.util.Collections;
 import java.util.List;
 import java.util.Optional;
 import java.util.concurrent.CompletableFuture;

 import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class RequestCounsellingReminderServiceImplTest {

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private RequestCounsellingRepository requestCounsellingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private RequestCounsellingReminderServiceImpl reminderService;

    private final Integer VALID_USER_ID = 1;
    private final Integer INVALID_USER_ID = -1;
    private final Integer ZERO_USER_ID = 0;

    private SchoolOwner mockSchoolOwner;

    // Dữ liệu hardcode
    private List<Object[]> overdueResults;
    private List<User> admins;
    private List<SchoolOwner> schoolOwnersSchool1;
    private List<SchoolOwner> schoolOwnersSchool2;

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

        // Chỉ khởi tạo dữ liệu, không stub ở đây
        overdueResults = new ArrayList<>();
        overdueResults.add(new Object[]{1, 2}); // School 1 có 2 yêu cầu quá hạn
        overdueResults.add(new Object[]{2, 1}); // School 2 có 1 yêu cầu quá hạn

        admins = new ArrayList<>();
        User admin = User.builder()
                .id(1)
                .username("admin1")
                .password("password")
                .email("admin@example.com")
                .fullname("Admin User")
                .role(ERole.ROLE_ADMIN)
                .status(true)
                .dob(LocalDate.of(1980, 1, 1))
                .phone("1234567890")
                .build();
        admins.add(admin);

        schoolOwnersSchool1 = new ArrayList<>();
        User owner1 = User.builder()
                .id(2)
                .username("owner1")
                .password("password")
                .email("owner1@example.com")
                .fullname("Owner One")
                .role(ERole.ROLE_SCHOOL_OWNER)
                .status(true)
                .dob(LocalDate.of(1985, 5, 10))
                .phone("0987654321")
                .build();
        SchoolOwner schoolOwner1 = SchoolOwner.builder()
                .id(1)
                .user(owner1)
                .expectedSchool("School 1")
                .publicPermission(true)
                .assignTime(LocalDate.now())
                .build();
        schoolOwnersSchool1.add(schoolOwner1);

        schoolOwnersSchool2 = new ArrayList<>();
        User owner2 = User.builder()
                .id(3)
                .username("owner2")
                .password("password")
                .email("owner2@example.com")
                .fullname("Owner Two")
                .role(ERole.ROLE_SCHOOL_OWNER)
                .status(true)
                .dob(LocalDate.of(1990, 3, 15))
                .phone("0123456789")
                .build();
        SchoolOwner schoolOwner2 = SchoolOwner.builder()
                .id(2)
                .user(owner2)
                .expectedSchool("School 2")
                .publicPermission(false)
                .assignTime(LocalDate.now())
                .build();
        schoolOwnersSchool2.add(schoolOwner2);
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

    @Test
    void testCheckDueDateAndSendEmail_NoOverdueRequests() {
        // Arrange
        when(requestCounsellingRepository.countOverdueRequestsForAllSchools(
                eq(ERequestCounsellingStatus.OVERDUE.getValue()), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        // Act
        reminderService.checkDueDateAndSendEmail();

        // Assert
        verify(requestCounsellingRepository, times(1))
                .countOverdueRequestsForAllSchools(anyByte(), any(LocalDateTime.class));
        verify(userRepository, never()).findActiveUserByRole(any(ERole.class));
        verify(schoolOwnerRepository, never()).findAllBySchoolId(anyInt());
        verify(emailService, never()).sendRequestCounsellingReminder(anyString(), anyString(), anyInt(), anyString(), anyString());
    }

    @Test
    void testCheckDueDateAndSendEmail_WithOverdueRequests() {
        // Arrange
        when(requestCounsellingRepository.countOverdueRequestsForAllSchools(
                eq(ERequestCounsellingStatus.OVERDUE.getValue()), any(LocalDateTime.class)))
                .thenReturn(overdueResults);
        when(userRepository.findActiveUserByRole(ERole.ROLE_ADMIN)).thenReturn(admins);
        when(schoolOwnerRepository.findAllBySchoolId(1)).thenReturn(schoolOwnersSchool1);
        when(schoolOwnerRepository.findAllBySchoolId(2)).thenReturn(schoolOwnersSchool2);
        when(emailService.sendRequestCounsellingReminder(anyString(), anyString(), anyInt(), anyString(), anyString()))
                .thenReturn(CompletableFuture.completedFuture(null));

        // Act
        reminderService.checkDueDateAndSendEmail();

        // Assert
        verify(requestCounsellingRepository, times(1))
                .countOverdueRequestsForAllSchools(anyByte(), any(LocalDateTime.class));
        verify(userRepository, times(1)).findActiveUserByRole(ERole.ROLE_ADMIN);
        verify(schoolOwnerRepository, times(1)).findAllBySchoolId(1);
        verify(schoolOwnerRepository, times(1)).findAllBySchoolId(2);

        verify(emailService, times(1)).sendRequestCounsellingReminder(
                eq("admin@example.com"),
                eq("Admin User"),
                eq(3),
                eq("Overdue by more than 24 hours"),
                eq("http://localhost:3000/admin/management/reminder/request-reminder")
        );

        verify(emailService, times(1)).sendRequestCounsellingReminder(
                eq("owner1@example.com"),
                eq("Owner One"),
                eq(2),
                eq("Overdue by more than 24 hours"),
                eq("http://localhost:3000/public/school-owner/view-request?tab=Overdue")
        );

        verify(emailService, times(1)).sendRequestCounsellingReminder(
                eq("owner2@example.com"),
                eq("Owner Two"),
                eq(1),
                eq("Overdue by more than 24 hours"),
                eq("http://localhost:3000/public/school-owner/view-request?tab=Overdue")
        );
    }

    @Test
    void testCheckDueDateAndSendEmail_EmailSendingFails() {
        // Arrange
        when(requestCounsellingRepository.countOverdueRequestsForAllSchools(
                eq(ERequestCounsellingStatus.OVERDUE.getValue()), any(LocalDateTime.class)))
                .thenReturn(overdueResults);
        when(userRepository.findActiveUserByRole(ERole.ROLE_ADMIN)).thenReturn(admins);
        when(schoolOwnerRepository.findAllBySchoolId(1)).thenReturn(schoolOwnersSchool1);
        when(schoolOwnerRepository.findAllBySchoolId(2)).thenReturn(schoolOwnersSchool2);

        CompletableFuture<Void> failedFuture = new CompletableFuture<>();
        failedFuture.completeExceptionally(new RuntimeException("Email service down"));
        when(emailService.sendRequestCounsellingReminder(anyString(), anyString(), anyInt(), anyString(), anyString()))
                .thenReturn(failedFuture);

        // Act
        reminderService.checkDueDateAndSendEmail();

        // Assert
        verify(emailService, times(3)).sendRequestCounsellingReminder(anyString(), anyString(), anyInt(), anyString(), anyString());
    }
}
