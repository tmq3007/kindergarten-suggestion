package fa.pjb.back.controller.user_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fa.pjb.back.controller.UserController;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // Register JavaTimeModule
    }

    @Test
    void createUser_success() throws Exception {
        UserCreateDTO userCreateDTO = UserCreateDTO.builder()
                .id(null)
                .username("testuser")
                .fullname("Test User")
                .password("password123")
                .email("test@example.com")
                .role("ROLE_SCHOOL_OWNER")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .expectedSchool("Test School")
                .business_registration_number("1234567890")
                .build();

        MockMultipartFile imageFile = new MockMultipartFile(
                "images",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );
        List<MultipartFile> images = new ArrayList<>();
        images.add(imageFile);

        when(userService.createUser(any(UserCreateDTO.class), eq(images)))
                .thenReturn(userCreateDTO);

        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "data",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(userCreateDTO)
        );

        mockMvc.perform(multipart("/user/create")
                        .file(dataPart)
                        .file(imageFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User created successfully"))
                .andExpect(jsonPath("$.data.fullname").value("Test User"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.role").value("ROLE_SCHOOL_OWNER"));
    }

    @Test
    void createUser_withoutImages_success() throws Exception {
        UserCreateDTO userCreateDTO = UserCreateDTO.builder()
                .id(null)
                .username("testuser")
                .fullname("Test User")
                .password("password123")
                .email("test@example.com")
                .role("ROLE_ADMIN")
                .status(true)
                .phone("1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        when(userService.createUser(any(UserCreateDTO.class), any()))
                .thenReturn(userCreateDTO);

        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "data",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(userCreateDTO)
        );

        mockMvc.perform(multipart("/user/create")
                        .file(dataPart)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User created successfully"))
                .andExpect(jsonPath("$.data.fullname").value("Test User"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    void createUser_validationFailure() throws Exception {
        UserCreateDTO userCreateDTO = UserCreateDTO.builder()
                .id(null)
                .username("testuser")
                .build();

        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "data",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(userCreateDTO)
        );

        mockMvc.perform(multipart("/user/create")
                        .file(dataPart)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isBadRequest());
    }
}