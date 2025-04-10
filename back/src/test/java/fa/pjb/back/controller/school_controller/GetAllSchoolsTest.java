package fa.pjb.back.controller.school_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.controller.SchoolController;
import fa.pjb.back.model.vo.SchoolListVO;
import fa.pjb.back.service.SchoolService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GetAllSchoolsTest {

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
   * Normal Case
   * Description: Retrieve all schools successfully with default pagination and optional filters.
   * Expected: Returns HTTP 200 OK with a page of school details.
   */
  @Test
  void getAllSchools_Success() throws Exception {
    // Arrange
    int page = 1;
    int size = 10;
    Pageable pageable = PageRequest.of(page - 1, size);

    SchoolListVO schoolListVO = new SchoolListVO(
        1,
        (byte) 1,
        "Test School",
        "Test District",
        "Test Ward",
        "Test Province",
        "123 Test Street",
        "test@school.com",
        "+84123456789",
        LocalDate.now()
    );

    Page<SchoolListVO> mockPage = new PageImpl<>(Collections.singletonList(schoolListVO), pageable, 1);

    when(schoolService.getAllSchools(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), eq(pageable)))
        .thenReturn(mockPage);

    // Act
    ResultActions response = mockMvc.perform(get("/school/all")
        .param("page", String.valueOf(page))
        .param("size", String.valueOf(size)));

    // Assert
    response.andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
        .andExpect(jsonPath("$.message").value("Get all schools successfully."))
        .andExpect(jsonPath("$.data.content[0].id").value(1))
        .andExpect(jsonPath("$.data.content[0].name").value("Test School"))
        .andExpect(jsonPath("$.data.content[0].province").value("Test Province"))
        .andExpect(jsonPath("$.data.content[0].district").value("Test District"))
        .andExpect(jsonPath("$.data.content[0].street").value("123 Test Street"))
        .andExpect(jsonPath("$.data.content[0].email").value("test@school.com"))
        .andExpect(jsonPath("$.data.content[0].phone").value("+84123456789"))
        .andExpect(jsonPath("$.data.totalElements").value(1));
  }

  /**
   * Abnormal Case
   * Description: Retrieve all schools fails when pagination parameters are invalid (negative page).
   * Expected: Returns HTTP 400 Bad Request.
   */
  @Test
  void getAllSchools_Fail_InvalidPagination() throws Exception {
    // Act
    ResultActions response = mockMvc.perform(get("/school/all")
        .param("page", "-1")
        .param("size", "10"));

    // Assert
    response.andExpect(status().isBadRequest());
  }

  /**
   * Boundary Case
   * Description: Retrieve all schools with the minimum valid pagination (page=1, size=1).
   * Expected: Returns HTTP 200 OK with a single school.
   */
  @Test
  void getAllSchools_Boundary_MinValidPagination() throws Exception {
    // Arrange
    int page = 1;
    int size = 1;
    Pageable pageable = PageRequest.of(page - 1, size);

    SchoolListVO schoolListVO = new SchoolListVO(
        1,
        (byte) 0,
        "Min School",
        "Min District",
        "Min Ward",
        "Min Province",
        "Min Street",
        "min@school.com",
        "+84123456789",
        LocalDate.now()
    );

    Page<SchoolListVO> mockPage = new PageImpl<>(Collections.singletonList(schoolListVO), pageable, 1);

    when(schoolService.getAllSchools(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), eq(pageable)))
        .thenReturn(mockPage);

    // Act
    ResultActions response = mockMvc.perform(get("/school/all")
        .param("page", String.valueOf(page))
        .param("size", String.valueOf(size)));

    // Assert
    response.andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
        .andExpect(jsonPath("$.message").value("Get all schools successfully."))
        .andExpect(jsonPath("$.data.content[0].id").value(1))
        .andExpect(jsonPath("$.data.content[0].name").value("Min School"))
        .andExpect(jsonPath("$.data.content[0].province").value("Min Province"))
        .andExpect(jsonPath("$.data.totalElements").value(1));
  }

  /**
   * Far-Boundary Case
   * Description: Retrieve all schools with extremely large pagination and multiple results.
   * Expected: Returns HTTP 200 OK with multiple school details.
   */
  @Test
  void getAllSchools_FarBoundary_LargePagination() throws Exception {
    // Arrange
    int page = 1;
    int size = 1000; // Large page size
    Pageable pageable = PageRequest.of(page - 1, size);

    List<SchoolListVO> schoolList = List.of(
        new SchoolListVO(
            1,
            (byte) 1,
            "School 1",
            "District 1",
            "Ward 1",
            "Province 1",
            "Street 1",
            "school1@school.com",
            "+84123456781",
            LocalDate.now()
        ),
        new SchoolListVO(
            2,
            (byte) 1,
            "School 2",
            "District 2",
            "Ward 2",
            "Province 2",
            "Street 2",
            "school2@school.com",
            "+84123456782",
            LocalDate.now()
        )
    );

    Page<SchoolListVO> mockPage = new PageImpl<>(schoolList, pageable, 2);

    when(schoolService.getAllSchools(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), eq(pageable)))
        .thenReturn(mockPage);

    // Act
    ResultActions response = mockMvc.perform(get("/school/all")
        .param("page", String.valueOf(page))
        .param("size", String.valueOf(size)));

    // Assert
    response.andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
        .andExpect(jsonPath("$.message").value("Get all schools successfully."))
        .andExpect(jsonPath("$.data.content[0].id").value(1))
        .andExpect(jsonPath("$.data.content[0].name").value("School 1"))
        .andExpect(jsonPath("$.data.content[0].province").value("Province 1"))
        .andExpect(jsonPath("$.data.content[1].id").value(2))
        .andExpect(jsonPath("$.data.content[1].name").value("School 2"))
        .andExpect(jsonPath("$.data.content[1].province").value("Province 2"))
        .andExpect(jsonPath("$.data.totalElements").value(2));
  }
}