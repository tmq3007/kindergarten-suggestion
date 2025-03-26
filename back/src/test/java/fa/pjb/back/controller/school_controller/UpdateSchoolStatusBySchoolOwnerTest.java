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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class UpdateSchoolStatusBySchoolOwnerTest {

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
     * Test case for updating a school status by a school owner with valid data.
     * Description: Update a school status successfully with valid data and school owner role.
     * Expected: Returns HTTP 200 OK with a response containing the updated school status.
     */
    @Test
    void testUpdateSchoolStatusBySchoolOwner_NormalCase() throws Exception {
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status((byte) 1)
                .build();

        // Mock the school service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusBySchoolOwner(any(ChangeSchoolStatusDTO.class));

        // Perform the request and assert the response
        mockMvc.perform(put("/school/change-status/by-school-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Update school status successfully."));
    }

    /**
     * Test case for updating a school status by a school owner with a null status.
     * Description: Attempting to update a school status with null status should fail.
     * Expected: Returns HTTP 400 Bad Request.
     */
    @Test
    void testUpdateSchoolStatusBySchoolOwner_StatusNull() throws Exception {
        // Prepare a DTO with a null status to simulate invalid input
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null) // School ID is not used
                .status(null)  // Intentionally setting status to null
                .build();

        // Perform the request and expect a Bad Request response due to the null status
        mockMvc.perform(put("/school/change-status/by-school-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test case for updating a school status by a school owner with the minimum value for school status.
     * Description: Update a school status successfully when the school status is set to Byte.MIN_VALUE.
     * Expected: Returns HTTP 200 OK indicating the status was updated successfully.
     */
    @Test
    void testUpdateSchoolStatusBySchoolOwner_StatusMinValue() throws Exception {
        // Prepare DTO with minimum value for school status
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status(Byte.MIN_VALUE)
                .build();

        // Mock the school service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusBySchoolOwner(any(ChangeSchoolStatusDTO.class));

        // Perform the request and assert the response
        mockMvc.perform(put("/school/change-status/by-school-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    /**
     * Test case for updating a school status by a school owner with the minimum value + 1 for school status.
     * Description: Update a school status successfully when the school status is set to Byte.MIN_VALUE + 1.
     * Expected: Returns HTTP 200 OK indicating the status was updated successfully.
     */
    @Test
    void testUpdateSchoolStatusBySchoolOwner_StatusMinPlusOne() throws Exception {
        // Prepare a DTO with the minimum value + 1 for school status
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status((byte) -127)
                .build();

        // Mock the school service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusBySchoolOwner(any(ChangeSchoolStatusDTO.class));

        // Perform the request and assert the response
        mockMvc.perform(put("/school/change-status/by-school-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    /**
     * Test case for updating a school status by a school owner with a status value of zero.
     * Description: Update a school status successfully when the status is set to zero.
     * Expected: Returns HTTP 200 OK indicating the status was updated successfully.
     */
    @Test
    void testUpdateSchoolStatusBySchoolOwner_StatusZero() throws Exception {
        // Prepare a DTO with a status value of zero
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null) // School ID is not used in this context
                .status((byte) 0) // Status set to zero
                .build();

        // Mock the school service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusBySchoolOwner(any(ChangeSchoolStatusDTO.class));

        // Perform the request and assert the response
        mockMvc.perform(put("/school/change-status/by-school-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    /**
     * Test case for updating a school status by a school owner with the maximum value - 1 for school status.
     * Description: Update a school status successfully when the school status is set to Byte.MAX_VALUE - 1.
     * Expected: Returns HTTP 200 OK indicating the status was updated successfully.
     */
    @Test
    void testUpdateSchoolStatusBySchoolOwner_StatusMaxMinusOne() throws Exception {
        // Prepare a DTO with the maximum value - 1 for school status
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null)
                .status((byte) 126)
                .build();

        // Mock the school service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusBySchoolOwner(any(ChangeSchoolStatusDTO.class));

        // Perform the request and assert the response
        mockMvc.perform(put("/school/change-status/by-school-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    /**
     * Test case for updating a school status by a school owner with the maximum value for school status.
     * Description: Update a school status successfully when the school status is set to Byte.MAX_VALUE.
     * Expected: Returns HTTP 200 OK indicating the status was updated successfully.
     */
    @Test
    void testUpdateSchoolStatusBySchoolOwner_StatusMaxValue() throws Exception {
        // Prepare a DTO with the maximum value for school status
        ChangeSchoolStatusDTO dto = ChangeSchoolStatusDTO.builder()
                .schoolId(null) // School ID is not used in this context
                .status(Byte.MAX_VALUE) // Status set to maximum value
                .build();

        // Mock the school service to do nothing when called with the DTO
        doNothing().when(schoolService).updateSchoolStatusBySchoolOwner(any(ChangeSchoolStatusDTO.class));

        // Perform the request and assert the response
        mockMvc.perform(put("/school/change-status/by-school-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }
}
