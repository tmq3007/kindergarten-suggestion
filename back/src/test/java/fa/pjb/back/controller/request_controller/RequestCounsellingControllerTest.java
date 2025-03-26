package fa.pjb.back.controller.request_controller;

import fa.pjb.back.controller.RequestCounsellingController;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.service.RequestCounsellingReminderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
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

    @BeforeEach
    void setUp() {
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

}
