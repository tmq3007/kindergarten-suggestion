package fa.pjb.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ParentControllerTest {
    private MockMvc mockMvc;

    @Mock
    private ParentService parentService;

    @InjectMocks
    private ParentController parentController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(parentController).build();
    }

    @Test
    void testChangePassword() throws Exception {
        ChangePasswordDTO changePasswordDTO = ChangePasswordDTO.builder()
                .oldPassword("oldPass123")
                .newPassword("newPass123")
                .build();

        doNothing().when(parentService).changePassword(1, "oldPass123", "newPass123");

        mockMvc.perform(put("/parent/1/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changePasswordDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Password changed successfully"));

        verify(parentService, times(1)).changePassword(1, "oldPass123", "newPass123");
    }

    @Test
    void testEditParent() throws Exception {
        ParentUpdateDTO updateDTO = ParentUpdateDTO.builder()
                .fullname("New Name")
                .email("newemail@example.com")
                .role("ROLE_PARENT")
                .status(true)
                .phone("+1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        ParentVO updatedParent = ParentVO.builder()
                .id(1)
                .username("newusername")
                .fullname("New Name")
                .email("newemail@example.com")
                .role("ROLE_PARENT")
                .status(true)
                .phone("+1234567890")
                .dob(LocalDate.of(1990, 1, 1))
                .build();

        when(parentService.editParent(anyInt(), any(), any())).thenReturn(updatedParent);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
                objectMapper.writeValueAsBytes(updateDTO));
        MockMultipartFile imagePart = new MockMultipartFile("image", "image.jpg", "image/jpeg", new byte[0]);

        mockMvc.perform(multipart("/parent/edit/1")
                        .file(dataPart)
                        .file(imagePart)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isMethodNotAllowed());


      //  verify(parentService, times(1)).editParent(anyInt(), any(), any());
    }

    @Test
    void testGetParentById() throws Exception {
        ParentVO parentVO = ParentVO.builder()
                .id(1)
                .username("parentuser")
                .fullname("Parent Name")
                .email("parent@example.com")
                .role("ROLE_PARENT")
                .status(true)
                .phone("+9876543210")
                .dob(LocalDate.of(1985, 5, 15))
                .build();

        when(parentService.getParentById(1)).thenReturn(parentVO);

        mockMvc.perform(get("/parent/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Parent details retrieved successfully"))
                .andExpect(jsonPath("$.data.fullname").value("Parent Name"));

        verify(parentService, times(1)).getParentById(1);
    }
}
