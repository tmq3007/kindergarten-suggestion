package fa.pjb.back.controller.parent_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.controller.ParentController;
import fa.pjb.back.service.ParentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class EnrollParentTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ParentService parentService;

    @InjectMocks
    private ParentController parentController;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(parentController).build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Test case for successfully enrolling a parent.
     * Description: Admin successfully enrolls a parent with valid user ID.
     * Expected: Returns HTTP 200 OK with success message and true data.
     */
    @Test
    void testEnrollParent_Success() throws Exception {
        // Mock service to return true for successful enrollment
        when(parentService.enrollParent(anyInt())).thenReturn(true);

        // Perform the request and assert the response
        mockMvc.perform(post("/parent/enroll/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Parent enrolled successfully"))
                .andExpect(jsonPath("$.data").value(true));
    }

    /**
     * Test case for failing to enroll when parent doesn't exist.
     * Description: Admin attempts to enroll a parent but user doesn't exist.
     * Expected: Returns HTTP 200 OK with success message but false data.
     */
    @Test
    void testEnrollParent_UserNotFound() throws Exception {
        // Mock service to return false when user not found
        when(parentService.enrollParent(anyInt())).thenReturn(false);

        // Perform the request and assert the response
        mockMvc.perform(post("/parent/enroll/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Parent enrolled successfully"))
                .andExpect(jsonPath("$.data").value(false));
    }

    /**
     * Test case for enrolling parent with minimum valid user ID.
     * Description: Admin enrolls parent with minimum possible user ID (1).
     * Expected: Returns HTTP 200 OK with success message and true data.
     */
    @Test
    void testEnrollParent_MinUserId() throws Exception {
        // Mock service to return true for successful enrollment
        when(parentService.enrollParent(1)).thenReturn(true);

        // Perform the request and assert the response
        mockMvc.perform(post("/parent/enroll/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Parent enrolled successfully"))
                .andExpect(jsonPath("$.data").value(true));
    }

    /**
     * Test case for enrolling parent with maximum valid user ID.
     * Description: Admin enrolls parent with maximum possible user ID (Integer.MAX_VALUE).
     * Expected: Returns HTTP 200 OK with success message and true/false data depending on mock.
     */
    @Test
    void testEnrollParent_MaxUserId() throws Exception {
        // Mock service to return true for successful enrollment
        when(parentService.enrollParent(Integer.MAX_VALUE)).thenReturn(true);

        // Perform the request and assert the response
        mockMvc.perform(post("/parent/enroll/" + Integer.MAX_VALUE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Parent enrolled successfully"))
                .andExpect(jsonPath("$.data").value(true));
    }

    /**
     * Test case for enrolling parent when user is already enrolled.
     * Description: Admin attempts to enroll a parent who is already enrolled.
     * Expected: Returns HTTP 200 OK with success message but false data.
     */
    @Test
    void testEnrollParent_AlreadyEnrolled() throws Exception {
        // Mock service to return false when user is already enrolled
        when(parentService.enrollParent(anyInt())).thenReturn(false);

        // Perform the request and assert the response
        mockMvc.perform(post("/parent/enroll/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Parent enrolled successfully"))
                .andExpect(jsonPath("$.data").value(false));
    }
}