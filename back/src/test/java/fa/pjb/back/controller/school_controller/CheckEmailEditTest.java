package fa.pjb.back.controller.school_controller;

import fa.pjb.back.controller.SchoolController;
import fa.pjb.back.service.SchoolService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CheckEmailEditTest {

    private MockMvc mockMvc;

    @Mock
    private SchoolService schoolService;

    @InjectMocks
    private SchoolController schoolController;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(schoolController).build();
    }

    /**
     * Normal Case
     * Description: Check email edit successfully with valid email and schoolId.
     * Expected: Returns HTTP 200 OK with a boolean indicating whether the email exists for another school.
     */
    @Test
    void checkEmailEdit_Success() throws Exception {
        String email = "test@example.com";
        Integer schoolId = 1;

        when(schoolService.checkEditingEmailExists(email, schoolId)).thenReturn(true);

        ResultActions response = mockMvc.perform(post("/school/check-editing-email")
                .param("email", email)
                .param("schoolId", String.valueOf(schoolId)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Email checked!"))
                .andExpect(jsonPath("$.data").value("true"));
    }

    /**
     * Abnormal Case
     * Description: Check email edit fails when email is empty.
     * Expected: Returns HTTP 400 Bad Request.
     */
    @Test
    void checkEmailEdit_Fail_EmptyEmail() throws Exception {
        String email = ""; // Empty email
        Integer schoolId = 1;

        ResultActions response = mockMvc.perform(post("/school/check-editing-email")
                .param("email", email)
                .param("schoolId", String.valueOf(schoolId)));

        response.andExpect(status().isBadRequest()); // Expect HTTP 400
    }

    /**
     * Boundary Case
     * Description: Check email edit with the shortest valid email and the smallest schoolId.
     * Expected: Returns HTTP 200 OK with a boolean indicating whether the email exists for another school.
     */
    @Test
    void checkEmailEdit_Boundary_MinValidEmailAndSchoolId() throws Exception {
        String email = "a@b.co";
        Integer schoolId = 1;

        when(schoolService.checkEditingEmailExists(email, schoolId)).thenReturn(false);

        ResultActions response = mockMvc.perform(post("/school/check-editing-email")
                .param("email", email)
                .param("schoolId", String.valueOf(schoolId)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Email checked!"))
                .andExpect(jsonPath("$.data").value("false"));
    }

    /**
     * Near-Boundary Case
     * Description: Check email edit with an invalid email format and a valid schoolId.
     * Expected: Returns HTTP 400 Bad Request.
     */
    @Test
    void checkEmailEdit_NearBoundary_InvalidEmailFormat() throws Exception {
        String email = "invalid-email";
        Integer schoolId = 1;

        ResultActions response = mockMvc.perform(post("/school/check-editing-email")
                .param("email", email)
                .param("schoolId", String.valueOf(schoolId)));

        response.andExpect(status().isBadRequest());
    }

    /**
     * Far-Boundary Case
     * Description: Check email edit with a very long email and the maximum schoolId.
     * Expected: Returns HTTP 200 OK with a boolean indicating whether the email exists for another school.
     */
    @Test
    void checkEmailEdit_FarBoundary_VeryLongEmailAndMaxSchoolId() throws Exception {
        String email = "veryverylongemail@domain.com";
        Integer schoolId = Integer.MAX_VALUE;

        when(schoolService.checkEditingEmailExists(email, schoolId)).thenReturn(true);

        ResultActions response = mockMvc.perform(post("/school/check-editing-email")
                .param("email", email)
                .param("schoolId", String.valueOf(schoolId)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Email checked!"))
                .andExpect(jsonPath("$.data").value("true"));
    }
}