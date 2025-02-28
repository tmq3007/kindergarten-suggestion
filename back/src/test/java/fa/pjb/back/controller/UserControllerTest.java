package fa.pjb.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.service.UserService;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private List<UserVO> returnUserVOList;

    @BeforeEach
    void setup() {
        returnUserVOList = Arrays.asList(
                new UserVO(1, "John Doe", "john@example.com", "USER", "+84123456789", "Parent", "Active"),
                new UserVO(2, "Jane Smith", "jane@example.com", "ADMIN", "+84987654321", "Parent", "Deactivate"),
                new UserVO(3, "Jane Smith", "jane@example.com", "ADMIN", "+84987654321", "Admin", "Deactivate"),
                new UserVO(4, "Jane Smith", "jane@example.com", "ADMIN", "+84987654321", "Admin", "Activate"),
                new UserVO(5, "Jane Smith", "jane@example.com", "ADMIN", "+84987654321", "School Owner", "Deactivate"),
                new UserVO(6, "Jane Smith", "jane@example.com", "ADMIN", "+84987654321", "School Owner", "Activate")
        );

    }

    /**
     * ✅ Normal Case: Default Pagination
     */
    @Test
    void testGetAllUsers_DefaultPagination() throws Exception {
        Page<UserVO> page = new PageImpl<>(returnUserVOList);
        when(userService.getAllUsers(any(),any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/user")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(6))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"));
    }

    /**
     * ✅ Normal Case: Filtering by Role (e.g., ADMIN)
     */
    @Test
    void testGetAllUsers_FilterByRole() throws Exception {
        List<UserVO> admins = returnUserVOList.stream()
                .filter(user -> "ADMIN".equals(user.role()))
                .toList();
        Page<UserVO> page = new PageImpl<>(admins);
        when(userService.getAllUsers(any(),any(), eq("ADMIN"), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/user")
                        .param("role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(admins.size()))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"));
    }

    /**
     * ✅ Normal Case: Filtering by Email
     */
    @Test
    void testGetAllUsers_FilterByEmail() throws Exception {
        Page<UserVO> page = new PageImpl<>(List.of(returnUserVOList.get(0)));
        when(userService.getAllUsers(any(),any(), any(), eq("john@example.com"), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/user")
                        .param("email", "john@example.com")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"));
    }

    /**
     * ✅ Normal Case: Filtering by Name
     */
    @Test
    void testGetAllUsers_FilterByName() throws Exception {
        Page<UserVO> page = new PageImpl<>(List.of(returnUserVOList.get(1)));
        when(userService.getAllUsers(any(),any(), any(), any(), eq("Jane Smith"), any())).thenReturn(page);

        mockMvc.perform(get("/api/user")
                        .param("name", "Jane Smith")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"));
    }

    /**
     * ✅ Normal Case: Filtering by Phone Number
     */
    @Test
    void testGetAllUsers_FilterByPhone() throws Exception {
        Page<UserVO> page = new PageImpl<>(List.of(returnUserVOList.get(1)));
        when(userService.getAllUsers(any(),any(), any(), any(), any(), eq("+84987654321"))).thenReturn(page);

        mockMvc.perform(get("/api/user")
                        .param("phone", "+84987654321")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"));
    }

    /**
     * ✅ Normal Case: Empty Result
     */
    @Test
    void testGetAllUsers_EmptyResult() throws Exception {
        Page<UserVO> emptyPage = new PageImpl<>(Collections.emptyList());
        when(userService.getAllUsers(any(),any(), any(), any(), any(), any())).thenReturn(emptyPage);

        mockMvc.perform(get("/api/user")
                        .param("name", "not exist")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isEmpty())
                .andExpect(jsonPath("$.data.content.length()").value(0))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"));
    }
    /**
     * ❌ Abnormal Case: Invalid Page Size
     */
    @Test
    void testGetAllUsers_AbnormalInvalidPageSize() throws Exception {
        mockMvc.perform(get("/api/user")
                        .param("size", "500")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.globalErrors[0].message").value("Page size exceeds the maximum limit"));
    }
    /**
     * ❌ Abnormal Case: Invalid Page
     */
    @Test
    void testGetAllUsers_AbnormalInvalidPageNumber() throws Exception {
        mockMvc.perform(get("/api/user")
                        .param("page", "-10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.globalErrors[0].message").value("Invalid page number"));
    }
    /**
     * ❌ Boundary Case: Invalid Page
     */
    @Test
    void testGetAllUsers_BoundaryInvalidPageNumber() throws Exception {
        mockMvc.perform(get("/api/user")
                        .param("page", "-1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.globalErrors[0].message").value("Invalid page number"));
    }

    /**
     * ❌ Boundary Case: Invalid Page Size
     */
    @Test
    void testGetAllUsers_BoundaryInvalidPageSize() throws Exception {
        mockMvc.perform(get("/api/user")
                        .param("size", "51")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.globalErrors[0].message").value("Page size exceeds the maximum limit"));
    }
}
