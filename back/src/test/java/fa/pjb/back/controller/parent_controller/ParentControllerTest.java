package fa.pjb.back.controller.parent_controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fa.pjb.back.common.exception._14xx_data.IncorrectPasswordException;
import fa.pjb.back.controller.ParentController;
import fa.pjb.back.model.dto.ChangePasswordDTO;
import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.service.ParentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ParentControllerTest {
    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ParentService parentService;

    @InjectMocks
    private ParentController parentController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(parentController).build();
    }

    @Test
    void changePassword_Success() throws Exception {
        ChangePasswordDTO request = new ChangePasswordDTO("oldPass123", "NewPass456");
        doNothing().when(parentService).changePassword(6, "oldPass123", "NewPass456");

        mockMvc.perform(put("/parent/6/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));
    }

    @Test
    void changePassword_Fail_InvalidOldPassword() throws Exception {
        ChangePasswordDTO request = new ChangePasswordDTO("wrongOldPass", "NewPass456");

        doThrow(new IncorrectPasswordException())
                .when(parentService).changePassword(6, "wrongOldPass", "NewPass456");

        mockMvc.perform(put("/parent/6/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }


    @Test
    void editParent_Success() throws Exception {
        ParentUpdateDTO updateDTO = ParentUpdateDTO.builder()
                .fullname("John Doe")
                .email("john.doe@example.com")
                .phone("+123456789")
                .dob(LocalDate.of(1990, 1, 1))
                .role("parent")
                .build();

        ParentVO responseVO = ParentVO.builder()
                .id(1)
                .fullname("John Doe")
                .email("john.doe@example.com")
                .phone("+123456789")
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        MockMultipartFile jsonFile = new MockMultipartFile("data", "", "application/json", objectMapper.writeValueAsBytes(updateDTO));
        MockMultipartFile imageFile = new MockMultipartFile("image", "profile.jpg", "image/jpeg", new byte[10]);

        when(parentService.editParent(eq(1), any(ParentUpdateDTO.class), any())).thenReturn(responseVO);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/parent/edit/1")
                        .file(jsonFile)
                        .file(imageFile)
                        .with(request -> { request.setMethod("PUT"); return request; })
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Parent updated successfully"));

    }

    @Test
    void editParent_InvalidEmailFormat() throws Exception {
        ParentUpdateDTO updateDTO = ParentUpdateDTO.builder()
                .fullname("John Doe")
                .email("invalid-email")
                .phone("+123456789")
                .dob(LocalDate.of(1990, 1, 1))
                .role("parent")
                .build();

        MockMultipartFile jsonFile = new MockMultipartFile("data", "", "application/json", objectMapper.writeValueAsBytes(updateDTO));

        mockMvc.perform(MockMvcRequestBuilders.multipart("/parent/edit/1")
                        .file(jsonFile)
                        .with(request -> { request.setMethod("PUT"); return request; }) // Chuyển multipart thành PUT
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest());

    }

    @Test
    void getParentById_Success() throws Exception {
        ParentVO parentVO = ParentVO.builder()
                .id(1)
                .fullname("John Doe")
                .email("john.doe@example.com")
                .phone("+123456789")
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        when(parentService.getParentById(1)).thenReturn(parentVO);

        mockMvc.perform(get("/parent/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullname").value("John Doe"));
    }

    @Test
    void getParentById_NotFound() throws Exception {
        when(parentService.getParentById(1)).thenReturn(null);

        mockMvc.perform(get("/1"))
                .andExpect(status().isNotFound());
    }
}
