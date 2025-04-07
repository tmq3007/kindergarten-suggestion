package fa.pjb.back.controller.request_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.controller.RequestCounsellingController;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.service.RequestCounsellingReminderService;
import fa.pjb.back.service.RequestCounsellingService;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RequestCounsellingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RequestCounsellingReminderService reminderService;

    @InjectMocks
    private RequestCounsellingController requestCounsellingController;

    private RequestCounsellingReminderVO validReminder;
    private RequestCounsellingReminderVO singleRequestReminder;
    private RequestCounsellingVO requestCounsellingVO;
    @Mock
    private RequestCounsellingService requestCounsellingService;
    private ObjectMapper objectMapper;

    // Test data variables
    private RequestCounsellingDTO normalRequest;
    private RequestCounsellingDTO minimalRequest;
    private RequestCounsellingDTO maximalRequest;
    private RequestCounsellingVO normalResponse;
    private RequestCounsellingVO minimalResponse;
    private RequestCounsellingVO maximalResponse;


    @BeforeEach
    void setUp() {

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        mockMvc = MockMvcBuilders.standaloneSetup(requestCounsellingController).build();

        // 🟢 Normal case: multiple overdue requests
        validReminder = RequestCounsellingReminderVO.builder()
                .title("Request Counselling Reminder")
                .description("You have 3 request counselling that are overdue.")
                .build();

        // 🔵 Boundary case:  1 request overdue
        singleRequestReminder = RequestCounsellingReminderVO.builder()
                .title("Request Counselling Reminder")
                .description("You have 1 request counselling that is overdue.")
                .build();
        requestCounsellingVO = new RequestCounsellingVO(
            1,
            "Test School",
            "Test inquiry",
            (byte) 0,
            "test@example.com",
            "1234567890",
            "Test Name",
            null,
            LocalDateTime.now().plusDays(1),
            "Test response"
        );

        // Normal case setup
        normalRequest = new RequestCounsellingDTO(
                1, // userId
                100, // schoolId
                "Need help with enrollment", // inquiry
                (byte) 1, // status
                "user@example.com", // email
                "1234567890", // phone
                "John Doe", // name
                LocalDateTime.now().plusDays(7) // dueDate
        );

        normalResponse = RequestCounsellingVO.builder()
                .id(1)
                .schoolName("Test School")
                .inquiry(normalRequest.inquiry())
                .status(normalRequest.status())
                .email(normalRequest.email())
                .phone(normalRequest.phone())
                .name(normalRequest.name())
                .address("123 Test St")
                .dueDate(normalRequest.dueDate())
                .response("Pending")
                .build();

        // Minimal boundary case setup
        minimalRequest = new RequestCounsellingDTO(
                1, // userId
                1, // minimal schoolId
                "A", // minimal inquiry
                (byte) 0, // minimal status
                "a@b.c", // minimal email
                "1", // minimal phone
                "A", // minimal name
                LocalDateTime.now().plusMinutes(1) // minimal future dueDate
        );

        minimalResponse = RequestCounsellingVO.builder()
                .id(2)
                .schoolName("Minimal School")
                .inquiry(minimalRequest.inquiry())
                .status(minimalRequest.status())
                .email(minimalRequest.email())
                .phone(minimalRequest.phone())
                .name(minimalRequest.name())
                .address("1 St")
                .dueDate(minimalRequest.dueDate())
                .response("Pending")
                .build();

        // Maximal boundary case setup
        String maxInquiry = "A".repeat(1000); // Assuming 1000 is max length for inquiry
        String maxEmail = "a".repeat(244) + "@example.com"; // 254 chars is typical max for email
        String maxPhone = "1".repeat(15); // Assuming 15 is max for phone
        String maxName = "A".repeat(255); // Assuming 255 is max for name

        maximalRequest = new RequestCounsellingDTO(
                999999, // large userId
                999999, // large schoolId
                maxInquiry,
                (byte) 127, // max value for byte
                maxEmail,
                maxPhone,
                maxName,
                LocalDateTime.now().plusYears(10) // far future dueDate
        );

        maximalResponse = RequestCounsellingVO.builder()
                .id(3)
                .schoolName("Max School")
                .inquiry(maximalRequest.inquiry())
                .status(maximalRequest.status())
                .email(maximalRequest.email())
                .phone(maximalRequest.phone())
                .name(maximalRequest.name())
                .address("999 Max St")
                .dueDate(maximalRequest.dueDate())
                .response("Pending")
                .build();
    }

    /** 🟢 NORMAL CASE: User has multiple overdue requests */
    @Test
    void checkOverdueForUser_ShouldReturnReminder_WhenOverdueExists() throws Exception {
        Integer userId = 1;
        when(reminderService.checkOverdueForSchoolOwner(userId)).thenReturn(validReminder);

        mockMvc.perform(get("/counselling/alert-reminder")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reminder checked!"))
                .andExpect(jsonPath("$.data.title").value("Request Counselling Reminder"))
                .andExpect(jsonPath("$.data.description").value("You have 3 request counselling that are overdue."));
    }

    /** ❌ ABNORMAL CASE: Valid user but no overdue requests */
    @Test
    void checkOverdueForUser_ShouldReturnNull_WhenNoOverdue() throws Exception {
        Integer userId = 2;
        when(reminderService.checkOverdueForSchoolOwner(userId)).thenReturn(null);

        mockMvc.perform(get("/counselling/alert-reminder")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reminder checked!"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    /** ❌ ABNORMAL CASE: User does not exist */
    @Test
    void checkOverdueForUser_ShouldReturnNull_WhenUserNotFound() throws Exception {
        Integer userId = 9999;
        when(reminderService.checkOverdueForSchoolOwner(userId)).thenReturn(null);

        mockMvc.perform(get("/counselling/alert-reminder")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reminder checked!"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    /** ⚠ BOUNDARY CASE: User has exactly one overdue request */
    @Test
    void checkOverdueForUser_ShouldReturnReminder_WhenOnlyOneOverdue() throws Exception {
        Integer userId = 3;
        when(reminderService.checkOverdueForSchoolOwner(userId)).thenReturn(singleRequestReminder);

        mockMvc.perform(get("/counselling/alert-reminder")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reminder checked!"))
                .andExpect(jsonPath("$.data.title").value("Request Counselling Reminder"))
                .andExpect(jsonPath("$.data.description").value("You have 1 request counselling that is overdue."));
    }

    /** ⚠ BOUNDARY CASE: userId = 0 (Invalid) */
    @Test
    void checkOverdueForUser_ShouldReturnBadRequest_WhenUserIdIsZero() throws Exception {
        mockMvc.perform(get("/counselling/alert-reminder")
                        .param("userId", "0")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    /** ⚠ BOUNDARY CASE: Extremely large userId (simulating non-existing user) */
    @Test
    void checkOverdueForUser_ShouldReturnNull_WhenUserIdIsVeryLarge() throws Exception {
        Integer userId = Integer.MAX_VALUE;
        when(reminderService.checkOverdueForSchoolOwner(userId)).thenReturn(null);

        mockMvc.perform(get("/counselling/alert-reminder")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Reminder checked!"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    // Tests for getAllRequests
    @Test
    // Test case 1: Lấy tất cả request với params mặc định
    void getAllRequests_defaultParams() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(0, 10), 1);
        when(requestCounsellingService.getAllRequests(1, 10, null, null, null, null, null, null)).thenReturn(page);

        mockMvc.perform(get("/counselling/all")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
            .andExpect(jsonPath("$.message").value("All parents retrieved successfully"))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Name"));
    }

    // Test case 2: Lấy request với status và name filter
    @Test
    void getAllRequests_withStatusAndName() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(0, 5), 1);
        when(requestCounsellingService.getAllRequests(1, 5, (byte) 0, null, "Test", null, null, null)).thenReturn(page);

        mockMvc.perform(get("/counselling/all")
                .param("size", "5")
                .param("status", "0")
                .param("name", "Test")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("All parents retrieved successfully"))
            .andExpect(jsonPath("$.data.content[0].status").value(0))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Name"));
    }

    // Test case 3: Lấy request với tất cả params
    @Test
    void getAllRequests_withAllParams() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(0, 10), 1);
        LocalDateTime dueDate = LocalDateTime.now().plusDays(1);
        when(requestCounsellingService.getAllRequests(1, 10, (byte) 0, "test@example.com", "Test", "1234567890", "Test School", dueDate))
            .thenReturn(page);

        mockMvc.perform(get("/counselling/all")
                .param("status", "0")
                .param("email", "test@example.com")
                .param("name", "Test")
                .param("phone", "1234567890")
                .param("schoolName", "Test School")
                .param("dueDate", dueDate.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("All parents retrieved successfully"))
            .andExpect(jsonPath("$.data.content[0].email").value("test@example.com"))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Name"));
    }

    @Test
        // Test case 4: Lấy request với page/size âm (kiểm tra hành vi)
    void getAllRequests_negativePageAndSize() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(0, 10), 1);
        when(requestCounsellingService.getAllRequests(-1, -10, null, null, null, null, null, null)).thenReturn(page);

        mockMvc.perform(get("/counselling/all")
                .param("page", "-1")
                .param("size", "-10")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()));
    }

    @Test
        // Test case 5: Lấy request không có kết quả
    void getAllRequests_noResults() throws Exception {
        Page<RequestCounsellingVO> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        when(requestCounsellingService.getAllRequests(1, 10, null, null, null, null, null, null)).thenReturn(emptyPage);

        mockMvc.perform(get("/counselling/all")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
            .andExpect(jsonPath("$.data.content").isEmpty());
    }

    // Tests for getAllReminder
    // Test case 1: Lấy tất cả reminder với params mặc định
    @Test
    void getAllReminder_defaultParams() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(0, 10), 1);
        when(reminderService.getAllReminder(1, 10, Arrays.asList((byte) 0, (byte) 2), "")).thenReturn(page);

        mockMvc.perform(get("/counselling/all-reminder")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("Fetched reminders successfully"))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Name"))
            .andExpect(jsonPath("$.data.content[0].status").value(0));
    }

    // Test case 2: Lấy reminder với name filter
    @Test
    void getAllReminder_withName() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(0, 5), 1);
        when(reminderService.getAllReminder(1, 5, Arrays.asList((byte) 0, (byte) 2), "Test")).thenReturn(page);

        mockMvc.perform(get("/counselling/all-reminder")
                .param("size", "5")
                .param("name", "Test")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("Fetched reminders successfully"))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Name"))
            .andExpect(jsonPath("$.data.content[0].status").value(0));
    }

    @Test
        // Test case 3: Lấy reminder với page lớn
    void getAllReminder_largePage() throws Exception {
        Page<RequestCounsellingVO> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(99, 10), 0);
        when(reminderService.getAllReminder(100, 10, Arrays.asList((byte) 0, (byte) 2), "")).thenReturn(emptyPage);

        mockMvc.perform(get("/counselling/all-reminder")
                .param("page", "100")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
            .andExpect(jsonPath("$.data.content").isEmpty());
    }

    @Test
        // Test case 4: Lấy reminder với name rỗng (sau trim)
    void getAllReminder_emptyName() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(0, 10), 1);
        when(reminderService.getAllReminder(1, 10, Arrays.asList((byte) 0, (byte) 2), "")).thenReturn(page);

        mockMvc.perform(get("/counselling/all-reminder")
                .param("name", "   ") // Chỉ có khoảng trắng
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()));
    }

    @Test
        // Test case 5: Lấy reminder không có kết quả
    void getAllReminder_noResults() throws Exception {
        Page<RequestCounsellingVO> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        when(reminderService.getAllReminder(1, 10, Arrays.asList((byte) 0, (byte) 2), "")).thenReturn(emptyPage);

        mockMvc.perform(get("/counselling/all-reminder")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
            .andExpect(jsonPath("$.data.content").isEmpty());
    }

    // Tests for getRemindersBySchoolOwner
    @Test
    void getRemindersBySchoolOwner_validSchoolOwnerId() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(0, 10), 1);
        when(reminderService.getRemindersBySchoolOwner(1, 10, 1, Arrays.asList((byte) 0, (byte) 2))).thenReturn(page);

        mockMvc.perform(get("/counselling/school-owner-reminders")
                .header("School-Owner-Id", "1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("Fetched reminders for school owner successfully"))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Name"))
            .andExpect(jsonPath("$.data.content[0].status").value(0));
    }

    @Test
        // Test case 2: Lấy reminder với page/size tùy chỉnh
    void getRemindersBySchoolOwner_customPageAndSize() throws Exception {
        Page<RequestCounsellingVO> page = new PageImpl<>(Collections.singletonList(requestCounsellingVO), PageRequest.of(1, 5), 1);
        when(reminderService.getRemindersBySchoolOwner(2, 5, 1, Arrays.asList((byte) 0, (byte) 2))).thenReturn(page);

        mockMvc.perform(get("/counselling/school-owner-reminders")
                .param("page", "2")
                .param("size", "5")
                .header("School-Owner-Id", "1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
            .andExpect(jsonPath("$.data.content[0].schoolName").value("Test School"));
    }

    @Test
        // Test case 3: Lấy reminder không có header School-Owner-Id
    void getRemindersBySchoolOwner_missingHeader() throws Exception {
        mockMvc.perform(get("/counselling/school-owner-reminders")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest()); // Spring sẽ ném lỗi vì header bắt buộc
    }

    @Test
        // Test case 4: Lấy reminder với schoolOwnerId không hợp lệ
    void getRemindersBySchoolOwner_invalidSchoolOwnerId() throws Exception {
        Page<RequestCounsellingVO> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        when(reminderService.getRemindersBySchoolOwner(1, 10, 999, Arrays.asList((byte) 0, (byte) 2))).thenReturn(emptyPage);

        mockMvc.perform(get("/counselling/school-owner-reminders")
                .header("School-Owner-Id", "999")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
            .andExpect(jsonPath("$.data.content").isEmpty());
    }

    @Test
        // Test case 5: Lấy reminder không có kết quả
    void getRemindersBySchoolOwner_noResults() throws Exception {
        Page<RequestCounsellingVO> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        when(reminderService.getRemindersBySchoolOwner(1, 10, 1, Arrays.asList((byte) 0, (byte) 2))).thenReturn(emptyPage);

        mockMvc.perform(get("/counselling/school-owner-reminders")
                .header("School-Owner-Id", "1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
            .andExpect(jsonPath("$.data.content").isEmpty());
    }

    // Normal Case
    @Test
    void createRequestCounselling_ShouldReturnSuccess_WhenValidRequest() {
        // Arrange
        when(requestCounsellingService.createRequestCounselling(normalRequest)).thenReturn(normalResponse);

        // Act
        ApiResponse<RequestCounsellingVO> response = requestCounsellingController.createRequestCounselling(normalRequest);

        // Assert
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Counseling request created successfully!", response.getMessage());
        assertEquals(normalResponse, response.getData());
        verify(requestCounsellingService, times(1)).createRequestCounselling(normalRequest);
    }

    // Abnormal Case
    @Test
    void createRequestCounselling_ShouldThrowException_WhenServiceFails() {
        // Arrange
        when(requestCounsellingService.createRequestCounselling(normalRequest))
                .thenThrow(new RuntimeException("Service unavailable"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            requestCounsellingController.createRequestCounselling(normalRequest);
        });
        verify(requestCounsellingService, times(1)).createRequestCounselling(normalRequest);
    }

    // Boundary Cases
    @Test
    void createRequestCounselling_ShouldAccept_WhenMinimalValidFields() {
        // Arrange
        when(requestCounsellingService.createRequestCounselling(minimalRequest)).thenReturn(minimalResponse);

        // Act
        ApiResponse<RequestCounsellingVO> response = requestCounsellingController.createRequestCounselling(minimalRequest);

        // Assert
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Counseling request created successfully!", response.getMessage());
        assertEquals(minimalResponse, response.getData());
        verify(requestCounsellingService, times(1)).createRequestCounselling(minimalRequest);
    }

    @Test
    void createRequestCounselling_ShouldAccept_WhenMaximalValidFields() {
        // Arrange
        when(requestCounsellingService.createRequestCounselling(maximalRequest)).thenReturn(maximalResponse);

        // Act
        ApiResponse<RequestCounsellingVO> response = requestCounsellingController.createRequestCounselling(maximalRequest);

        // Assert
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Counseling request created successfully!", response.getMessage());
        assertEquals(maximalResponse, response.getData());
        verify(requestCounsellingService, times(1)).createRequestCounselling(maximalRequest);
    }
}
