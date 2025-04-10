package fa.pjb.back.controller.request_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    @Mock
    private RequestCounsellingService requestCounsellingService;

    private ObjectMapper objectMapper;
    private RequestCounsellingDTO validRequest;
    private RequestCounsellingVO responseVO;

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
        RequestCounsellingVO requestCounsellingVO = new RequestCounsellingVO(
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
        objectMapper.registerModule(new JavaTimeModule()); // Essential for LocalDateTime serialization

        // Setup valid request data
        validRequest = new RequestCounsellingDTO(
                1,
                1,
                "Need counseling for child",
                (byte) 0,
                "parent@example.com",
                "1234567890",
                "John Doe",
                LocalDateTime.of(2025, 4, 15, 10, 0)
        );

        // Setup expected response
        responseVO = RequestCounsellingVO.builder()
                .id(1)
                .schoolName("Test School")
                .inquiry("Need counseling for child")
                .status((byte) 0)
                .email("parent@example.com")
                .phone("1234567890")
                .name("John Doe")
                .address("123 Test Street")
                .dueDate(LocalDateTime.of(2025, 4, 15, 10, 0))
                .response(null)
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

    // Normal case
    @Test
    void createRequestCounselling_normalCase_success() throws Exception {
        when(requestCounsellingService.createRequestCounselling(any(RequestCounsellingDTO.class)))
                .thenReturn(responseVO);

        String requestJson = objectMapper.writeValueAsString(validRequest);

        mockMvc.perform(post("/counselling/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Counseling request created successfully!"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.schoolName").value("Test School"))
                .andExpect(jsonPath("$.data.email").value("parent@example.com"));
    }

    // Abnormal case: Missing required fields
    @Test
    void createRequestCounselling_missingRequiredFields_validationError() throws Exception {
        RequestCounsellingDTO invalidRequest = new RequestCounsellingDTO(
                1,
                null, // Missing schoolId
                "Need counseling",
                (byte) 0,
                null, // Missing email
                "1234567890",
                "John Doe",
                LocalDateTime.of(2025, 4, 15, 10, 0)
        );

        String requestJson = objectMapper.writeValueAsString(invalidRequest);

        mockMvc.perform(post("/counselling/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    // Boundary case: Minimum valid input
    @Test
    void createRequestCounselling_minimumValidInput_success() throws Exception {
        RequestCounsellingDTO minimumRequest = new RequestCounsellingDTO(
                null, // userId can be null
                1,
                "a",
                (byte) 0,
                "a@b.c", // minimum valid email
                "1234",     // minimum phone
                "A",     // minimum name
                LocalDateTime.now().plusDays(1)
        );

        RequestCounsellingVO minimumResponse = RequestCounsellingVO.builder()
                .id(1)
                .schoolName("Test School")
                .inquiry("")
                .status((byte) 0)
                .email("a@b.c")
                .phone("1234")
                .name("A")
                .address("123 Test Street")
                .dueDate(LocalDateTime.now().plusDays(1))
                .build();

        when(requestCounsellingService.createRequestCounselling(any(RequestCounsellingDTO.class)))
                .thenReturn(minimumResponse);

        String requestJson = objectMapper.writeValueAsString(minimumRequest);

        mockMvc.perform(post("/counselling/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Counseling request created successfully!"));
    }


    // Boundary case: Past due date
    @Test
    void createRequestCounselling_pastDueDate_success() throws Exception {
        RequestCounsellingDTO pastDueRequest = new RequestCounsellingDTO(
                1,
                1,
                "Need counseling",
                (byte) 0,
                "parent@example.com",
                "1234567890",
                "John Doe",
                LocalDateTime.of(2025, 1, 1, 10, 0) // Past date
        );

        RequestCounsellingVO pastDueResponse = RequestCounsellingVO.builder()
                .id(1)
                .schoolName("Test School")
                .inquiry("Need counseling")
                .status((byte) 0)
                .email("parent@example.com")
                .phone("1234567890")
                .name("John Doe")
                .address("123 Test Street")
                .dueDate(LocalDateTime.of(2025, 1, 1, 10, 0))
                .build();

        when(requestCounsellingService.createRequestCounselling(any(RequestCounsellingDTO.class)))
                .thenReturn(pastDueResponse);

        String requestJson = objectMapper.writeValueAsString(pastDueRequest);

        mockMvc.perform(post("/counselling/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()));
    }
}
