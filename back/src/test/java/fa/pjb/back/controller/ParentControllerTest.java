package fa.pjb.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.common.exception.IncorrectPasswordException;
import fa.pjb.back.common.exception.user.UserNotFoundException;
import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ChangePasswordDTO;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.service.ParentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ParentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ParentService parentService;

    @InjectMocks
    private ParentController parentController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private ParentDTO parentDTO;

    @BeforeEach
    void setUp() {
        // Manually set up MockMvc with the controller
        mockMvc = MockMvcBuilders.standaloneSetup(parentController).build();

        parentDTO = new ParentDTO();
        parentDTO.setId(1);
        parentDTO.setEmail("test@example.com");
        parentDTO.setFullName("John Doe");
        parentDTO.setPhone("1234567890");
        parentDTO.setDob(LocalDate.of(1990, 1, 1));
        parentDTO.setStatus(true);
        parentDTO.setDistrict("District 1");
        parentDTO.setWard("Ward 1");
        parentDTO.setProvince("Province 1");
        parentDTO.setStreet("123 Street");
    }

    // Tests for changePassword
    @Test
    void changePassword_Success() throws Exception {
        // Arrange
        Integer parentId = 1;
        ChangePasswordDTO request = new ChangePasswordDTO();
        request.setOldPassword("oldPassword");
        request.setNewPassword("newPassword");

        doNothing().when(parentService).changePassword(eq(parentId), eq("oldPassword"), eq("newPassword"));

        // Act
        ResultActions response = mockMvc.perform(put("/parent/{parentId}/change-password", parentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Password changed successfully"))
                .andExpect(jsonPath("$.data").doesNotExist());
        verify(parentService, times(1)).changePassword(parentId, "oldPassword", "newPassword");
    }



    @Test
    void changePassword_ParentNotFound_Fail() throws Exception {
        // Arrange
        Integer parentId = 1;
        ChangePasswordDTO request = new ChangePasswordDTO();
        request.setOldPassword("oldPassword");
        request.setNewPassword("newPassword");

        doThrow(new UserNotFoundException( ))
                .when(parentService).changePassword(eq(parentId), eq("oldPassword"), eq("newPassword"));

        // Act
        ResultActions response = mockMvc.perform(put("/parent/{parentId}/change-password", parentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // Assert
        response.andExpect(status().isNotFound());
        verify(parentService, times(1)).changePassword(parentId, "oldPassword", "newPassword");
    }

    @Test
    void changePassword_Boundary_MinValidId() throws Exception {
        // Arrange
        Integer parentId = 1; // Minimum valid ID
        ChangePasswordDTO request = new ChangePasswordDTO();
        request.setOldPassword("oldPassword");
        request.setNewPassword("newPassword");

        doNothing().when(parentService).changePassword(eq(parentId), eq("oldPassword"), eq("newPassword"));

        // Act
        ResultActions response = mockMvc.perform(put("/parent/{parentId}/change-password", parentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Password changed successfully"))
                .andExpect(jsonPath("$.data").doesNotExist());
        verify(parentService, times(1)).changePassword(parentId, "oldPassword", "newPassword");
    }


    // Tests for getParentById
    @Test
    void getParentById_Success() throws Exception {
        // Arrange
        Integer parentId = 1;
        when(parentService.getParentById(parentId)).thenReturn(parentDTO);

        // Act
        ResultActions response = mockMvc.perform(get("/parent/{parentId}", parentId)
                .contentType(MediaType.APPLICATION_JSON));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Parent details retrieved successfully"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("John Doe"));
        verify(parentService, times(1)).getParentById(parentId);
    }

    @Test
    void getParentById_NotFound_Fail() throws Exception {
        // Arrange
        Integer parentId = 999;
        when(parentService.getParentById(parentId))
                .thenThrow(new UserNotFoundException( ));

        // Act
        ResultActions response = mockMvc.perform(get("/parent/{parentId}", parentId)
                .contentType(MediaType.APPLICATION_JSON));

        // Assert
        response.andExpect(status().isNotFound()); // Default behavior without exception handling
        verify(parentService, times(1)).getParentById(parentId);
    }

    @Test
    void getParentById_Boundary_MinValidId() throws Exception {
        // Arrange
        Integer parentId = 1; // Minimum valid ID
        when(parentService.getParentById(parentId)).thenReturn(parentDTO);

        // Act
        ResultActions response = mockMvc.perform(get("/parent/{parentId}", parentId)
                .contentType(MediaType.APPLICATION_JSON));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Parent details retrieved successfully"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));
        verify(parentService, times(1)).getParentById(parentId);
    }
}