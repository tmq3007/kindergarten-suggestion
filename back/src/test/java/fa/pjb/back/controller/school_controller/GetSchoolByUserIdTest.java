//package fa.pjb.back.controller.school_controller;
//import fa.pjb.back.controller.SchoolController;
//import fa.pjb.back.model.entity.User;
//import fa.pjb.back.model.vo.SchoolDetailVO;
//import fa.pjb.back.service.SchoolService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.MediaType;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//import static org.mockito.ArgumentMatchers.anyInt;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
///**
// * Test class for SchoolController.
// */
//@ExtendWith(MockitoExtension.class)
//public class GetSchoolByUserIdTest {
//
//  private MockMvc mockMvc;
//
//  @Mock
//  private SchoolService schoolService;
//
//  @InjectMocks
//  private SchoolController schoolController;
//
//  private User user;
//
//  @BeforeEach
//  void setUp() {
//    mockMvc = MockMvcBuilders.standaloneSetup(schoolController).build();
//    user = new User();
//    user.setId(1);
//    user.setUsername("testuser");
//  }
//
//  /**
//   * Normal Case:
//   * Description: Successfully retrieve school details with valid user and name.
//   * Expected: Returns HTTP 200 with SchoolDetailVO data.
//   */
//  @Test
//  @WithMockUser(username = "testuser", roles = {"USER"})
//  void getSchoolByUserId_Success_WithName() throws Exception {
//    // Arrange
//    SchoolDetailVO schoolVO = SchoolDetailVO.builder()
//        .id(1)
//        .name("Test School")
//        .province("Test Province")
//        .district("Test District")
//        .email("test@school.com")
//        .phone("+84123456789")
//        .build();
//    when(schoolService.getSchoolByUserId(anyInt(), anyString())).thenReturn(schoolVO);
//
//    // Act & Assert
//    mockMvc.perform(get("/by-user")
//            .param("name", "Test School")
//            .contentType(MediaType.APPLICATION_JSON))
//        .andExpect(status().isOk())
//        .andExpect(jsonPath("$.code").value(200))
//        .andExpect(jsonPath("$.message").value("Get school by user ID successfully."))
//        .andExpect(jsonPath("$.data.id").value(1))
//        .andExpect(jsonPath("$.data.name").value("Test School"))
//        .andExpect(jsonPath("$.data.province").value("Test Province"));
//  }
//
//  /**
//   * Normal Case:
//   * Description: Successfully retrieve school details with valid user and null name.
//   * Expected: Returns HTTP 200 with SchoolDetailVO data.
//   */
//  @Test
//  @WithMockUser(username = "testuser", roles = {"USER"})
//  void getSchoolByUserId_Success_NoName() throws Exception {
//    // Arrange
//    SchoolDetailVO schoolVO = SchoolDetailVO.builder()
//        .id(1)
//        .name("Test School")
//        .province("Test Province")
//        .district("Test District")
//        .email("test@school.com")
//        .phone("+84123456789")
//        .build();
//    when(schoolService.getSchoolByUserId(anyInt(), anyString())).thenReturn(schoolVO);
//
//    // Act & Assert
//    mockMvc.perform(get("/by-user")
//            .contentType(MediaType.APPLICATION_JSON))
//        .andExpect(status().isOk())
//        .andExpect(jsonPath("$.code").value(200))
//        .andExpect(jsonPath("$.message").value("Get school by user ID successfully."))
//        .andExpect(jsonPath("$.data.id").value(1))
//        .andExpect(jsonPath("$.data.name").value("Test School"));
//  }
//
//  /**
//   * Boundary Case:
//   * Description: Retrieve school details with minimum valid user ID (0).
//   * Expected: Returns HTTP 200 with SchoolDetailVO data if valid.
//   */
//  @Test
//  @WithMockUser(username = "testuser", roles = {"USER"})
//  void getSchoolByUserId_Boundary_MinUserId() throws Exception {
//    // Arrange
//    user.setId(0); // Minimum user ID
//    SchoolDetailVO schoolVO = SchoolDetailVO.builder()
//        .id(1)
//        .name("Test School")
//        .province("Test Province")
//        .district("Test District")
//        .email("test@school.com")
//        .phone("+84123456789")
//        .build();
//    when(schoolService.getSchoolByUserId(anyInt(), anyString())).thenReturn(schoolVO);
//
//    // Act & Assert
//    mockMvc.perform(get("/by-user")
//            .param("name", "Test School")
//            .contentType(MediaType.APPLICATION_JSON))
//        .andExpect(status().isOk())
//        .andExpect(jsonPath("$.code").value(200))
//        .andExpect(jsonPath("$.data.id").value(1));
//  }
//
//  /**
//   * Boundary Case:
//   * Description: Retrieve school details with maximum valid user ID (Integer.MAX_VALUE).
//   * Expected: Returns HTTP 200 with SchoolDetailVO data if valid.
//   */
//  @Test
//  @WithMockUser(username = "testuser", roles = {"USER"})
//  void getSchoolByUserId_Boundary_MaxUserId() throws Exception {
//    // Arrange
//    user.setId(Integer.MAX_VALUE); // Maximum user ID
//    SchoolDetailVO schoolVO = SchoolDetailVO.builder()
//        .id(1)
//        .name("Test School")
//        .province("Test Province")
//        .district("Test District")
//        .email("test@school.com")
//        .phone("+84123456789")
//        .build();
//    when(schoolService.getSchoolByUserId(anyInt(), anyString())).thenReturn(schoolVO);
//
//    // Act & Assert
//    mockMvc.perform(get("/by-user")
//            .param("name", "Test School")
//            .contentType(MediaType.APPLICATION_JSON))
//        .andExpect(status().isOk())
//        .andExpect(jsonPath("$.code").value(200))
//        .andExpect(jsonPath("$.data.id").value(1));
//  }
//
//  /**
//   * Abnormal Case:
//   * Description: Attempt to retrieve school details when school is not found.
//   * Expected: Returns HTTP 500 with error message.
//   */
//  @Test
//  @WithMockUser(username = "testuser", roles = {"USER"})
//  void getSchoolByUserId_NoResult() throws Exception {
//    // Arrange
//    when(schoolService.getSchoolByUserId(anyInt(), anyString()))
//        .thenThrow(new RuntimeException("School not found for user ID: 999"));
//
//    // Act & Assert
//    mockMvc.perform(get("/by-user")
//            .param("name", "Test School")
//            .contentType(MediaType.APPLICATION_JSON))
//        .andExpect(status().isInternalServerError())
//        .andExpect(jsonPath("$.message").value("School not found for user ID: 999"));
//  }
//
//  /**
//   * Abnormal Case:
//   * Description: Attempt to retrieve school details without authentication.
//   * Expected: Returns HTTP 401 (Unauthorized).
//   */
//  @Test
//  void getSchoolByUserId_Unauthenticated() throws Exception {
//    // Act & Assert
//    mockMvc.perform(get("/by-user")
//            .param("name", "Test School")
//            .contentType(MediaType.APPLICATION_JSON))
//        .andExpect(status().isUnauthorized());
//  }
//}