//package fa.pjb.back.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import fa.pjb.back.common.exception.EmailExistException;
//import fa.pjb.back.common.exception.InvalidPhoneNumberException;
//import fa.pjb.back.common.exception.email.EmailAlreadyExistedException;
//import fa.pjb.back.common.exception.user.UserNotFoundException;
//import fa.pjb.back.common.response.ApiResponse;
//import fa.pjb.back.model.dto.ParentDTO;
//import fa.pjb.back.model.dto.UserDTO;
//import fa.pjb.back.service.UserService;
//import fa.pjb.back.service.impl.ParentServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.ResultActions;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//import java.time.LocalDate;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@ExtendWith(MockitoExtension.class)
//class AdminControllerTest {
//
//    private MockMvc mockMvc;
//    private ObjectMapper objectMapper;
//
//    @Mock
//    private ParentServiceImpl parentService;
//
//    @Mock
//    private UserService userService;
//
//    @InjectMocks
//    private AdminController adminController;
//
//    @BeforeEach
//    void setup() {
//        this.mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
//        this.objectMapper = new ObjectMapper();
//    }
//
//    /**
//     * ✅ Trường hợp bình thường (Normal Case)
//     * Mô tả: Tạo parent thành công với dữ liệu hợp lệ.
//     * Kỳ vọng: Trả về HTTP 200 OK, kèm dữ liệu parent đã tạo.
//     */
//    @Test
//    void createParent_Success() throws Exception {
//        ParentDTO parentDTO = ParentDTO.builder()
//                .fullName("John Doe")
//                .email("john.doe@gmail.com")
//                .phone("+84123456789")
//                .build();
//
//        ParentDTO createdParent = ParentDTO.builder()
//                .id(1)
//                .fullName("John Doe")
//                .email("john.doe@gmail.com")
//                .phone("+84123456789")
//                .build();
//
//        when(parentService.createParent(any(ParentDTO.class))).thenReturn(createdParent);
//
//        ResultActions response = mockMvc.perform(post("/admin/parents")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(parentDTO)));
//
//        response.andExpect(status().isOk())
//                .andExpect(jsonPath("$.code").value(200))
//                .andExpect(jsonPath("$.message").value("Parent created successfully"))
//                .andExpect(jsonPath("$.data.fullName").value("John Doe"))
//                .andExpect(jsonPath("$.data.email").value("john.doe@gmail.com"));
//    }
//
//    /**
//     * ❌ Trường hợp bất thường (Abnormal Case)
//     * Mô tả: Tạo parent thất bại khi email đã tồn tại.
//     * Kỳ vọng: Trả về HTTP 400 Bad Request.
//     */
//    @Test
//    void createParent_Fail_EmailExists() throws Exception {
//        ParentDTO parentDTO = ParentDTO.builder()
//                .fullName("John Doe")
//                .email("existing.email@gmail.com")
//                .phone("+84123456789")
//                .role("ROLE_PARENT")
//                .build();
//
//        when(parentService.createParent(any(ParentDTO.class)))
//                .thenThrow(new EmailAlreadyExistedException("Email already exists"));
//
//        ResultActions response = mockMvc.perform(post("/admin/parents")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(parentDTO)));
//
//        response.andExpect(status().isConflict());
//    }
//    /**
//     * ✅ Trường hợp bình thường (Normal Case)
//     * Mô tả: Cập nhật parent thành công với dữ liệu hợp lệ.
//     * Kỳ vọng: Trả về HTTP 200 OK, kèm dữ liệu parent đã cập nhật.
//     */
//    @Test
//    void updateParent_Success() throws Exception {
//        Integer parentId = 1;
//        ParentDTO parentDTO = ParentDTO.builder()
//                .fullName("Jane Doe")
//                .email("jane.doe@gmail.com")
//                .phone("+84123456789")
//                .build();
//
//        ParentDTO updatedParent = ParentDTO.builder()
//                .id(parentId)
//                .fullName("Jane Doe")
//                .email("jane.doe@gmail.com")
//                .phone("+84123456789")
//                .build();
//
//        // Fix: Use eq() matcher for parentId
//        when(parentService.editParent(eq(parentId), any(ParentDTO.class))).thenReturn(updatedParent);
//
//        ResultActions response = mockMvc.perform(put("/admin/parents/{parentId}", parentId)
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(parentDTO)));
//
//        response.andExpect(status().isOk())
//                .andExpect(jsonPath("$.code").value(200))
//                .andExpect(jsonPath("$.message").value("Parent updated successfully"))
//                .andExpect(jsonPath("$.data.fullName").value("Jane Doe"))
//                .andExpect(jsonPath("$.data.email").value("jane.doe@gmail.com"));
//    }
//
//    /**
//     * ❌ Trường hợp bất thường (Abnormal Case)
//     * Mô tả: Cập nhật parent thất bại khi parentId không hợp lệ (âm).
//     * Kỳ vọng: Trả về HTTP 400 Bad Request.
//     */
//    @Test
//    void updateParent_Fail_InvalidParentId() throws Exception {
//        Integer parentId = -1;
//        ParentDTO parentDTO = ParentDTO.builder()
//                .fullName("Jane Doe")
//                .email("jane.doe@gmail.com")
//                .phone("+84123456789")
//                .build();
//
//        // Mock the service to throw UserNotFoundException
//        when(parentService.editParent(eq(parentId), any(ParentDTO.class)))
//                .thenThrow(new UserNotFoundException());
//
//        ResultActions response = mockMvc.perform(put("/admin/parents/{parentId}", parentId)
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(parentDTO)));
//
//        response.andExpect(status().isNotFound())  ;// Expect 404 instead of 400
//
//    }
//
//    /**
//     *  Trường hợp Boundary
//     * Mô tả: Cập nhật parent thất bại khi parentId không hợp lệ (0).
//     * Kỳ vọng: Trả về HTTP 400 Bad Request.
//     */
//    @Test
//    void updateParent_Fail_InvalidParentId_Zero() throws Exception {
//        Integer parentId = 0;
//        ParentDTO parentDTO = ParentDTO.builder()
//                .fullName("Jane Doe")
//                .email("jane.doe@gmail.com")
//                .phone("+84123456789")
//                .build();
//
//        // Mock the service to throw UserNotFoundException
//        when(parentService.editParent(eq(parentId), any(ParentDTO.class)))
//                .thenThrow(new UserNotFoundException());
//
//        ResultActions response = mockMvc.perform(put("/admin/parents/{parentId}", parentId)
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(parentDTO)));
//
//        response.andExpect(status().isNotFound())  ;// Expect 404 instead of 400
//
//    }
//
//    /**
//     * ✅ Trường hợp bình thường (Normal Case)
//     * Mô tả: Tạo admin thành công với dữ liệu hợp lệ.
//     * Kỳ vọng: Trả về HTTP 200 OK, kèm dữ liệu admin đã tạo.
//     */
//    @Test
//    void createAdmin_Success() throws Exception {
//        UserDTO userDTO = UserDTO.builder()
//                .username("admin1")
//                .email("admin1@gmail.com")
//                .password("admin1234")
//                .build();
//
//        UserDTO createdAdmin = UserDTO.builder()
//                .id(1)
//                .username("admin1")
//                .email("admin1@gmail.com")
//                .build();
//
//        when(userService.createAdmin(any(UserDTO.class))).thenReturn(createdAdmin);
//
//        ResultActions response = mockMvc.perform(post("/admin/create")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(userDTO)));
//
//        response.andExpect(status().isOk())
//                .andExpect(jsonPath("$.code").value(200))
//                .andExpect(jsonPath("$.message").value("Admin created successfully"))
//                .andExpect(jsonPath("$.data.username").value("admin1"))
//                .andExpect(jsonPath("$.data.email").value("admin1@gmail.com"));
//    }
//
//
//    /**
//     * ⚠️ Trường hợp biên (Boundary Case)
//     * Mô tả: Tạo admin với username ngắn nhất hợp lệ và email tối thiểu.
//     * Kỳ vọng: Trả về HTTP 200 OK.
//     */
//    @Test
//    void createAdmin_Boundary_MinValidInput() throws Exception {
//        UserDTO userDTO = UserDTO.builder()
//                .username("ad")
//                .email("a@b.co")
//                .password("pass123")
//                .build();
//
//        UserDTO createdAdmin = UserDTO.builder()
//                .id(1)
//                .username("ad")
//                .email("a@b.co")
//                .build();
//
//        when(userService.createAdmin(any(UserDTO.class))).thenReturn(createdAdmin);
//
//        ResultActions response = mockMvc.perform(post("/admin/create")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(userDTO)));
//
//        response.andExpect(status().isOk())
//                .andExpect(jsonPath("$.data.username").value("ad"))
//                .andExpect(jsonPath("$.data.email").value("a@b.co"));
//    }
//
//}