package fa.pjb.back.controller.admin_controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fa.pjb.back.controller.AdminController;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
    }

    @Test
    void createUser_Success() throws Exception {
        UserCreateDTO request = UserCreateDTO.builder()
                .id(1)
                .username("john_doe")
                .fullname("John Doe")
                .password("SecurePass123!")
                .email("john.doe@example.com")
                .role("ROLE_SCHOOL_OWNER")
                .status(Boolean.TRUE)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Harvard")
                .build();

        lenient().when(userService.createUser(any(UserCreateDTO.class))).thenReturn(request);

        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User created successfully"));
    }

    @Test
    void createUser_MissingUsername() throws Exception {
        UserCreateDTO request = UserCreateDTO.builder()
                .fullname("John Doe")
                .password("SecurePass123!")
                .email("john.doe@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Harvard")
                .build();

        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createUser_InvalidEmailFormat() throws Exception {
        UserCreateDTO request = UserCreateDTO.builder()
                .username("john_doe")
                .fullname("John Doe")
                .password("SecurePass123!")
                .email("")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Harvard")
                .build();

        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createUser_ShortPassword() throws Exception {
        UserCreateDTO request = UserCreateDTO.builder()
                .username("john_doe")
                .fullname("John Doe")
                .password("")
                .email("john.doe@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Harvard")
                .build();

        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createUser_BoundaryCase_MaxPhoneNumberLength() throws Exception {
        UserCreateDTO request = UserCreateDTO.builder()
                .username("john_doe")
                .fullname("John Doe")
                .password("SecurePass123!")
                .email("john.doe@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("12345678901234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Harvard")
                .build();

        lenient().when(userService.createUser(any(UserCreateDTO.class))).thenReturn(request);

        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void createUser_BoundaryCase_ExceedPhoneNumberLength() throws Exception {
        UserCreateDTO request = UserCreateDTO.builder()
                .username("john_doe")
                .fullname("John Doe")
                .password("SecurePass123!")
                .email("john.doe@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("123456789012345678901")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Harvard")
                .build();

        mockMvc.perform(post("/admin/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
