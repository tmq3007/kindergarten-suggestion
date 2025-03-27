package fa.pjb.back.controller.school_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.controller.SchoolController;
import fa.pjb.back.service.SchoolService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class MergeDraftTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private SchoolService schoolService;

    @InjectMocks
    private SchoolController schoolController;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(schoolController).build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Test case for successfully merging draft school information.
     * Description: Admin successfully merges draft school information with valid school ID.
     * Expected: Returns HTTP 200 OK with success message and true data.
     */
    @Test
    void testMergeDraft_Success() throws Exception {
        // Mock service to return true for successful merge
        when(schoolService.mergeDraft(anyInt())).thenReturn(true);

        // Perform the request and assert the response
        mockMvc.perform(put("/school/merger-draft/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Merge draft successfully."))
                .andExpect(jsonPath("$.data").value(true));
    }

    /**
     * Test case for failing to merge draft when draft doesn't exist.
     * Description: Admin attempts to merge draft but draft school doesn't exist.
     * Expected: Returns HTTP 200 OK with success message but false data.
     */
    @Test
    void testMergeDraft_DraftNotFound() throws Exception {
        // Mock service to return false when draft not found
        when(schoolService.mergeDraft(anyInt())).thenReturn(false);

        // Perform the request and assert the response
        mockMvc.perform(put("/school/merger-draft/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Merge draft successfully."))
                .andExpect(jsonPath("$.data").value(false));
    }

    /**
     * Test case for merging draft with minimum valid school ID.
     * Description: Admin merges draft with minimum possible school ID (1).
     * Expected: Returns HTTP 200 OK with success message and true data.
     */
    @Test
    void testMergeDraft_MinSchoolId() throws Exception {
        // Mock service to return true for successful merge
        when(schoolService.mergeDraft(1)).thenReturn(true);

        // Perform the request and assert the response
        mockMvc.perform(put("/school/merger-draft/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Merge draft successfully."))
                .andExpect(jsonPath("$.data").value(true));
    }

    /**
     * Test case for merging draft with maximum valid school ID.
     * Description: Admin merges draft with maximum possible school ID (Integer.MAX_VALUE).
     * Expected: Returns HTTP 200 OK with success message and true/false data depending on mock.
     */
    @Test
    void testMergeDraft_MaxSchoolId() throws Exception {
        // Mock service to return true for successful merge
        when(schoolService.mergeDraft(Integer.MAX_VALUE)).thenReturn(true);

        // Perform the request and assert the response
        mockMvc.perform(put("/school/merger-draft/" + Integer.MAX_VALUE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Merge draft successfully."))
                .andExpect(jsonPath("$.data").value(true));
    }

    /**
     * Test case for merging draft when error occurs during media deletion.
     * Description: Admin merges draft but error occurs when deleting old media.
     * Expected: Returns HTTP 200 OK with success message but false data.
     */
    @Test
    void testMergeDraft_MediaDeletionError() throws Exception {
        // Mock service to return false when media deletion fails
        when(schoolService.mergeDraft(anyInt())).thenReturn(false);

        // Perform the request and assert the response
        mockMvc.perform(put("/school/merger-draft/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Merge draft successfully."))
                .andExpect(jsonPath("$.data").value(false));
    }
}