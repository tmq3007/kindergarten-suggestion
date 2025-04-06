package fa.pjb.back.controller.school_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.enums.SchoolStatusEnum;
import fa.pjb.back.model.vo.ReviewVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.SchoolOwnerVO;
import fa.pjb.back.service.SchoolService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest

@AutoConfigureMockMvc(addFilters = false)
class AddSchoolTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SchoolService schoolService;

    @Autowired
    private ObjectMapper objectMapper;

    private SchoolDTO validSchoolDTO;
    private SchoolDetailVO schoolDetailVO;
    private String url;

    @BeforeEach
    void setUp() {
        url = "/api/school/add";

        // Valid SchoolDTO for successful case
        validSchoolDTO = new SchoolDTO(
                1, "Test School", 1, "http://test.com", SchoolStatusEnum.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 1000, 2000, Set.of(1, 2), Set.of(1, 2), Set.of(1), "Description"
        );

        // Expected SchoolDetailVO returned by service
        schoolDetailVO = new SchoolDetailVO(
                1, SchoolStatusEnum.SUBMITTED.getValue(), "Test School", (byte) 1, "District 1", "Ward 1", "Hanoi",
                "Street 1", "test@example.com", "+84123456789", (byte) 1, (byte) 1, 1000, 2000, "http://test.com",
                "Description", null, null, null, LocalDateTime.now(), null,
                Set.of(new SchoolOwnerVO(1,1,"test","test","test","test","test",null,LocalDate.now())),null
        );
    }

    // Test Case 1: Successful school creation with images
    @Test
    void testAddSchool_Success_WithImages() throws Exception {
        // Mock service response
        when(schoolService.addSchool(any(SchoolDTO.class), any(List.class))).thenReturn(schoolDetailVO);

        // Create mock multipart files
        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "test.jpg", "image/jpeg", "mock image content".getBytes()
        );
        MockMultipartFile dataFile = new MockMultipartFile(
                "data", "", "application/json", objectMapper.writeValueAsBytes(validSchoolDTO)
        );

        // Perform POST request
        mockMvc.perform(multipart(url)
                        .file(dataFile)
                        .file(imageFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(HttpStatus.CREATED.value()))
                .andExpect(jsonPath("$.message").value("School Created!"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Test School"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));
    }

    // Test Case 2: Validation failure (missing required fields)
    @Test
    void testAddSchool_ValidationFailure_MissingFields() throws Exception {
        // Invalid DTO with missing required fields
        SchoolDTO invalidDTO = new SchoolDTO(
                null, "", null, null, SchoolStatusEnum.SUBMITTED.getValue(),
                "", "", "", null, "", "", null, null, null, null, null, null, null, null
        );

        MockMultipartFile dataFile = new MockMultipartFile(
                "data", "", "application/json", objectMapper.writeValueAsBytes(invalidDTO)
        );

        // Perform POST request
        mockMvc.perform(multipart(url)
                        .file(dataFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Validation failed for object='data'. Error count: 13"))
                .andExpect(jsonPath("$.fieldErrors[?(@.property == 'userId')].message").value("must not be null"))
                .andExpect(jsonPath("$.fieldErrors[?(@.property == 'name')].message").value("School name is required"))
                .andExpect(jsonPath("$.fieldErrors[?(@.property == 'schoolType')].message").value("School type is required"))
                .andExpect(jsonPath("$.fieldErrors[?(@.property == 'province')].message").value("Province is required"))
                .andExpect(jsonPath("$.fieldErrors[?(@.property == 'email')].message").value(hasItem("Email is required")));
    }

    // Test Case 3: Validation failure (invalid fee range)
    @Test
    void testAddSchool_ValidationFailure_InvalidFeeRange() throws Exception {
        // Invalid DTO with feeFrom > feeTo
        SchoolDTO invalidFeeDTO = new SchoolDTO(
                1, "Test School", 1, "http://test.com", SchoolStatusEnum.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "+84123456789",
                1, 1, 2000, 1000, Set.of(1, 2), Set.of(1, 2), Set.of(1), "Description"
        );

        MockMultipartFile dataFile = new MockMultipartFile(
                "data", "", "application/json", objectMapper.writeValueAsBytes(invalidFeeDTO)
        );

        // Perform POST request
        mockMvc.perform(multipart(url)
                        .file(dataFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Validation failed for object='data'. Error count: 1"))
                .andExpect(jsonPath("$.globalErrors[?(@.message == 'Fee From must be less than Fee To')]").exists());
    }

    // Test Case 4: Service throws Exception
    @Test
    void testAddSchool_ServiceThrowsIOException() throws Exception {
        // Mock service to throw IOException
        when(schoolService.addSchool(any(SchoolDTO.class), any(List.class)))
                .thenThrow(new InvalidFileFormatException("Image upload failed"));

        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "test.jpg", "image/jpeg", "mock image content".getBytes()
        );
        MockMultipartFile dataFile = new MockMultipartFile(
                "data", "", "application/json", objectMapper.writeValueAsBytes(validSchoolDTO)
        );

        // Perform POST request
        mockMvc.perform(multipart(url)
                        .file(dataFile)
                        .file(imageFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(1404))
                .andExpect(jsonPath("$.message").exists()); // Adjust based on your exception handler
    }

    @Test
    void testAddSchool_ValidationFailure_InvalidPhoneFormat() throws Exception {
        // DTO with an invalid phone number (no "+" and too few digits)
        SchoolDTO invalidPhoneDTO = new SchoolDTO(
                1, "Test School", 1, "http://test.com", SchoolStatusEnum.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "test@example.com", "12345", // Invalid phone
                1, 1, 1000, 2000, Set.of(1, 2), Set.of(1, 2), Set.of(1), "Description"
        );

        MockMultipartFile dataFile = new MockMultipartFile(
                "data", "", "application/json", objectMapper.writeValueAsBytes(invalidPhoneDTO)
        );

        // Perform POST request
        mockMvc.perform(multipart(url)
                        .file(dataFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Validation failed for object='data'. Error count: 1"))
                .andExpect(jsonPath("$.fieldErrors[?(@.property == 'phone')].message").value("Invalid phone format"));
    }

    @Test
    void testAddSchool_ValidationFailure_InvalidEmailFormat() throws Exception {
        // DTO with an invalid email (no "@" or domain)
        SchoolDTO invalidEmailDTO = new SchoolDTO(
                1, "Test School", 1, "http://test.com", SchoolStatusEnum.SUBMITTED.getValue(),
                "Hanoi", "District 1", "Ward 1", "Street 1", "invalidemail", "+84123456789",
                1, 1, 1000, 2000, Set.of(1, 2), Set.of(1, 2), Set.of(1), "Description"
        );

        MockMultipartFile dataFile = new MockMultipartFile(
                "data", "", "application/json", objectMapper.writeValueAsBytes(invalidEmailDTO)
        );

        // Perform POST request
        mockMvc.perform(multipart(url)
                        .file(dataFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Validation failed for object='data'. Error count: 1"))
                .andExpect(jsonPath("$.fieldErrors[?(@.property == 'email')].message").value("Invalid email format"));
    }
}