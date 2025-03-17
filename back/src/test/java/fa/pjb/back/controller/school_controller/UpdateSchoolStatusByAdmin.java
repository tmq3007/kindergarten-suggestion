package fa.pjb.back.controller.school_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.controller.SchoolController;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.service.SchoolService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class UpdateSchoolStatusByAdmin {

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
     * Test case for updating a school status by an admin with valid data and authorization.
     * Description: Update a school status successfully with valid data and admin role.
     * Expected: Returns HTTP 200 OK with a response containing the updated school status.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_NormalCase() throws Exception {
        // Prepare a valid DTO to simulate a normal case
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status((byte) 1)
                .build();

        // Mock the school service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusByAdmin(any(ChangeSchoolStatusDTO.class));

        // Perform the request and assert the response
        mockMvc.perform(put("/school/change-status/by-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Update school status successfully."));
    }

    /**
     * Test case for updating a school status by an admin with invalid data where the status is null.
     * Description: Attempting to update a school status with null status should fail.
     * Expected: Returns HTTP 400 Bad Request.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_StatusNull() throws Exception {
        // Prepare a DTO with a null status to simulate invalid input
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status(null)  // Intentionally setting status to null
                .build();

        // Perform the request and expect a Bad Request response due to the null status
        mockMvc.perform(put("/school/change-status/by-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test case for updating a school status by an admin with the minimum value for school status.
     * Description: Update a school status successfully when the school status is set to Byte.MIN_VALUE.
     * Expected: Returns HTTP 200 OK indicating the status was updated successfully.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_StatusMinValue() throws Exception {
        // Prepare DTO with minimum value for school status
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status(Byte.MIN_VALUE)
                .build();

        // Stub the service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusByAdmin(any(ChangeSchoolStatusDTO.class));

        // Perform the request
        mockMvc.perform(put("/school/change-status/by-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                // Assert the response
                .andExpect(status().isOk());
    }


    /**
     * Test case for updating a school status by an admin with the maximum value for school status.
     * Description: Update a school status successfully when the school status is set to Byte.MAX_VALUE.
     * Expected: Returns HTTP 200 OK indicating the status was updated successfully.
     */
    @Test
    void testUpdateSchoolStatusByAdmin_StatusMaxValue() throws Exception {
        // Prepare DTO with maximum value for school status
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(1)
                .status(Byte.MAX_VALUE)
                .build();

        // Stub the service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusByAdmin(any(ChangeSchoolStatusDTO.class));

        // Perform the request
        mockMvc.perform(put("/school/change-status/by-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                // Assert the response
                .andExpect(status().isOk());
    }
}
