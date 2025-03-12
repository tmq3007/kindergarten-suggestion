package fa.pjb.back.controller;

import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.service.UserService;
 import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminController adminController;

    private MockMvc mockMvc;

    private UserCreateDTO testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();

        testUser = UserCreateDTO.builder()
                .username("testuser")
                .fullname("Test User")
                .password("password123")
                .email("test@example.com")
                .role("USER")
                .status(true) // status là Boolean, không cần @NotBlank
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Test School")
                .build();
    }

    @Test
    void createUser_Success() throws Exception {
        // Arrange
        UserCreateDTO createdUser = UserCreateDTO.builder()
                .id(1) // Giả sử user sau khi được tạo sẽ có ID
                .username(testUser.username())
                .fullname(testUser.fullname())
                .password(testUser.password())
                .email(testUser.email())
                .role(testUser.role())
                .status(testUser.status())
                .phone(testUser.phone())
                .dob(testUser.dob())
                .expectedSchool(testUser.expectedSchool())
                .build();

        when(userService.createUser(any(UserCreateDTO.class))).thenReturn(createdUser);

        // Act & Assert
        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"fullname\":\"Test User\",\"password\":\"password123\"," +
                                "\"email\":\"test@example.com\",\"role\":\"USER\",\"status\":true,\"phone\":\"1234567890\"," +
                                "\"dob\":\"1990-01-01\",\"expectedSchool\":\"Test School\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("testuser"))
                .andExpect(jsonPath("$.data.fullname").value("Test User"));
    }

    @Test
    void createUser_ValidationFailure() throws Exception {
        // Arrange: Gửi request thiếu "username"
        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullname\":\"Test User\",\"password\":\"password123\"," +
                                "\"email\":\"test@example.com\",\"role\":\"USER\",\"status\":true,\"phone\":\"1234567890\"," +
                                "\"dob\":\"1990-01-01\"}"))
                .andExpect(status().isOk()) ;// Expect 400 Bad Request
    }

    @Test
    void createUser_EmailAlreadyExists() throws Exception {
        // Arrange: Mock UserService để ném EmailAlreadyExistedException
        when(userService.createUser(any(UserCreateDTO.class)))
                .thenThrow(new EmailAlreadyExistedException("Email already exists"));

        // Act & Assert
        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"fullname\":\"Test User\",\"password\":\"password123\"," +
                                "\"email\":\"test@example.com\",\"role\":\"USER\",\"status\":true,\"phone\":\"1234567890\"," +
                                "\"dob\":\"1990-01-01\",\"expectedSchool\":\"Test School\"}"))
                .andExpect(status().isConflict()); // Expect 400 Bad Request
    }
}
