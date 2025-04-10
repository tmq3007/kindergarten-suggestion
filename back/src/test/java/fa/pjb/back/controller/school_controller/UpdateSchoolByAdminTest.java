package fa.pjb.back.controller.school_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.controller.SchoolController;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.vo.FacilityVO;
import fa.pjb.back.model.vo.MediaVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.UtilityVO;
import fa.pjb.back.service.SchoolService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.Validator;

import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UpdateSchoolByAdminTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Validator mockValidator;

    @Mock
    private SchoolService schoolService;

    @InjectMocks
    private SchoolController schoolController;

    @BeforeEach
    void setup() {
        mockValidator = mock(Validator.class);
        this.mockMvc = MockMvcBuilders
                .standaloneSetup(schoolController)
                .setValidator(mockValidator)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Normal Case
     * Description: Update school successfully with valid data and optional images.
     * Expected: Returns HTTP 200 OK with updated school details.
     */
    @Test
    void updateSchoolByAdmin_Success() throws Exception {
        // Prepare DTO and mock images
        SchoolDTO schoolDTO = SchoolDTO.builder()
                .id(1)
                .name("Updated School Name")
                .schoolType((int) 1)
                .website("https://updated-school.com")
                .province("Updated Province")
                .district("Updated District")
                .ward("Updated Ward")
                .street("123 Updated Street")
                .email("updated@school.com")
                .phone("+84123456789")
                .receivingAge((int) 1)
                .educationMethod((int) 2)
                .feeFrom(1000)
                .feeTo(2000)
                .facilities(Set.of(1, 2))
                .utilities(Set.of(3, 4))
                .description("Updated description")
                .build();

        MockMultipartFile image1 = new MockMultipartFile(
                "image", "image1.jpg", MediaType.IMAGE_JPEG_VALUE, "image1".getBytes());
        MockMultipartFile image2 = new MockMultipartFile(
                "image", "image2.jpg", MediaType.IMAGE_JPEG_VALUE, "image2".getBytes());

        SchoolDetailVO schoolDetailVO = SchoolDetailVO.builder()
                .id(1)
                .status((byte) 1)
                .name("Updated School Name")
                .schoolType((byte) 1)
                .district("Updated District")
                .ward("Updated Ward")
                .province("Updated Province")
                .street("123 Updated Street")
                .email("updated@school.com")
                .phone("+84123456789")
                .receivingAge((byte) 1)
                .educationMethod((byte) 2)
                .feeFrom(1000)
                .feeTo(2000)
                .website("https://updated-school.com")
                .description("Updated description")
                .facilities(Set.of(FacilityVO.builder().fid(1).build(), FacilityVO.builder().fid(2).build()))
                .utilities(Set.of(UtilityVO.builder().uid(3).build(), UtilityVO.builder().uid(4).build()))
                .imageList(List.of(MediaVO.builder().url("https://image1.jpg").build(), MediaVO.builder().url("https://image2.jpg").build()))
                .postedDate(new Date().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
                .build();

        when(schoolService.updateSchoolByAdmin(any(SchoolDTO.class), any(List.class))).thenReturn(schoolDetailVO);

        // Perform request
        ResultActions response = mockMvc.perform(multipart("/school/update/by-admin")
                .file(new MockMultipartFile("data", "", MediaType.APPLICATION_JSON_VALUE,
                        objectMapper.writeValueAsBytes(schoolDTO)))
                .file(image1)
                .file(image2)
                .contentType(MediaType.MULTIPART_FORM_DATA));

        // Assert response
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("School updated successfully"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Updated School Name"))
                .andExpect(jsonPath("$.data.province").value("Updated Province"))
                .andExpect(jsonPath("$.data.email").value("updated@school.com"))
                .andExpect(jsonPath("$.data.imageList[0].url").value("https://image1.jpg"));
    }

    /**
     * Boundary Case
     * Description: Update school with the minimum valid data (no images).
     * Expected: Returns HTTP 200 OK with updated school details.
     */
    @Test
    void updateSchoolByAdmin_Boundary_MinValidData() throws Exception {
        // Prepare DTO with minimal valid data
        SchoolDTO schoolDTO = SchoolDTO.builder()
                .id(1)
                .name("Min School")
                .schoolType((int) 0)
                .province("Min Province")
                .district("Min District")
                .ward("Min Ward")
                .street("Min Street")
                .email("min@school.com")
                .phone("+84123456789")
                .receivingAge((int) 0)
                .educationMethod((int) 0)
                .build();

        SchoolDetailVO schoolDetailVO = SchoolDetailVO.builder()
                .id(1)
                .name("Min School")
                .schoolType((byte) 0)
                .province("Min Province")
                .district("Min District")
                .ward("Min Ward")
                .street("Min Street")
                .email("min@school.com")
                .phone("+84123456789")
                .receivingAge((byte) 0)
                .educationMethod((byte) 0)
                .build();

        // Stub the method with the expected arguments
        when(schoolService.updateSchoolByAdmin(eq(schoolDTO), eq(null))).thenReturn(schoolDetailVO);

        // Perform request
        ResultActions response = mockMvc.perform(multipart("/school/update/by-admin")
                .file(new MockMultipartFile("data", "", MediaType.APPLICATION_JSON_VALUE,
                        objectMapper.writeValueAsBytes(schoolDTO)))
                .contentType(MediaType.MULTIPART_FORM_DATA));

        // Assert response
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Min School"))
                .andExpect(jsonPath("$.data.province").value("Min Province"));
    }

    /**
     * Far-Boundary Case
     * Description: Update school with extremely long valid data and multiple large images.
     * Expected: Returns HTTP 200 OK with updated school details.
     */
    @Test
    void updateSchoolByAdmin_FarBoundary_LargeDataAndImages() throws Exception {
        // Prepare DTO with extremely long data
        String longName = "A".repeat(255);
        String longProvince = "B".repeat(255);

        SchoolDTO schoolDTO = SchoolDTO.builder()
                .id(1)
                .name(longName)
                .schoolType((int) 1)
                .province(longProvince)
                .district("Long District")
                .ward("Long Ward")
                .street("Long Street")
                .email("long@school.com")
                .phone("+84123456789")
                .receivingAge((int) 1)
                .educationMethod((int) 2)
                .feeFrom(1000)
                .feeTo(2000)
                .facilities(Set.of(1, 2))
                .utilities(Set.of(3, 4))
                .description("Long description")
                .build();

        // Prepare large mock images
        MockMultipartFile image1 = new MockMultipartFile(
                "image", "image1.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[1024 * 1024]); // 1MB
        MockMultipartFile image2 = new MockMultipartFile(
                "image", "image2.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[1024 * 1024]); // 1MB

        SchoolDetailVO schoolDetailVO = SchoolDetailVO.builder()
                .id(1)
                .name(longName)
                .schoolType((byte) 1)
                .province(longProvince)
                .district("Long District")
                .ward("Long Ward")
                .street("Long Street")
                .email("long@school.com")
                .phone("+84123456789")
                .receivingAge((byte) 1)
                .educationMethod((byte) 2)
                .feeFrom(1000)
                .feeTo(2000)
                .facilities(Set.of(FacilityVO.builder().fid(1).build(), FacilityVO.builder().fid(2).build()))
                .utilities(Set.of(UtilityVO.builder().uid(3).build(), UtilityVO.builder().uid(4).build()))
                .imageList(List.of(MediaVO.builder().url("https://image1.jpg").build(), MediaVO.builder().url("https://image2.jpg").build()))
                .postedDate(new Date().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
                .build();

        when(schoolService.updateSchoolByAdmin(any(SchoolDTO.class), any(List.class))).thenReturn(schoolDetailVO);

        // Perform request
        ResultActions response = mockMvc.perform(multipart("/school/update/by-admin")
                .file(new MockMultipartFile("data", "", MediaType.APPLICATION_JSON_VALUE,
                        objectMapper.writeValueAsBytes(schoolDTO)))
                .file(image1)
                .file(image2)
                .contentType(MediaType.MULTIPART_FORM_DATA));

        // Assert response
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value(longName))
                .andExpect(jsonPath("$.data.province").value(longProvince));
    }
}