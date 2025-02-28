package fa.pjb.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fa.pjb.back.common.exception.GlobalExceptionHandler;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.service.ParentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class ParentControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ParentService parentService;

    @InjectMocks
    private ParentController parentController;

    private RegisterDTO registerDTO;
    private RegisterVO mockResponse;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(parentController).setControllerAdvice(new GlobalExceptionHandler()).build();
        this.objectMapper = new ObjectMapper();
        // Sample request payload
        registerDTO = new RegisterDTO("John Doe", "test@example.com", "+84 123456789", "password123");

        // Expected response from service
        mockResponse = new RegisterVO("John Doe", "test@example.com", "+84 123456789", null);
    }
    /**
     * ✅ Normal Case: Valid Registration
     */
    @Test
    void testRegister_Success() throws Exception {

        // Mocking the service method
        when(parentService.saveNewParent(any(RegisterDTO.class))).thenReturn(mockResponse);

        // Perform POST request and verify response
        ResultActions response = mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.CREATED.value()))
                .andExpect(jsonPath("$.message").value("Parent registered successfully"))
                .andExpect(jsonPath("$.data.fullname").value("John Doe"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));
    }

    /**
     * ❌ Abnormal Case: Fullname should not be empty
     */
    @Test
    void testRegister_EmptyFullname() throws Exception {
        RegisterDTO dto = new RegisterDTO(
                "",  // Empty fullname
                "test@example.com",
                "+84 123456789",
                "password123"
        );

        ResultActions response = mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)));
        response.andExpect(status().isBadRequest());
    }
    /**
     * ❌ Abnormal Case: Email should not be empty
     */
    @Test
    void testRegister_EmptyEmail() throws Exception {
        RegisterDTO dto = new RegisterDTO(
                "John Doe",  //
                "",
                "+84 123456789",
                "password123"
        );

        ResultActions response = mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)));
        response.andExpect(status().isBadRequest());
    }
    /**
     * ❌ Abnormal Case: Phone should not be empty
     */
    @Test
    void testRegister_EmptyPhone() throws Exception {
        RegisterDTO dto = new RegisterDTO(
                "John Doe",  //
                "test@example.com",
                "",
                "password123"
        );

        ResultActions response = mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)));
        response.andExpect(status().isBadRequest());
    }
    /**
     * ❌ Abnormal Case: Password should not be empty
     */
    @Test
    void testRegister_EmptyPass() throws Exception {
        RegisterDTO dto = new RegisterDTO(
                "John Doe",
                "test@example.com",
                "+84 123456789",
                ""
        );

        ResultActions response = mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)));
        response.andExpect(status().isBadRequest());
    }
    /**
     * ❌ Abnormal Case: Invalid Email Format
     */
    @Test
    void testRegister_InvalidEmail() throws Exception {
        RegisterDTO dto = new RegisterDTO(
                "John Doe",
                "invalid-email",  // Invalid email format
                "+84 123456789",
                "password123"
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    /**
     * ❌ Abnormal Case: Phone number does not match pattern
     */
    @Test
    void testRegister_InvalidPhone() throws Exception {
        RegisterDTO dto = new RegisterDTO(
                "John Doe",
                "test@example.com",
                "123456",  // Invalid phone format
                "password123"
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    /**
     * ❌ Boundary Case: Password too short (less than 7 characters)
     */
    @Test
    void testRegister_shortPassword() throws Exception {
        RegisterDTO dto = new RegisterDTO(
                "John Doe",
                "test@example.com",
                "+84 123456789",
                "a11231"  // Invalid password (too short)
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    /**
     * ❌ Boundary Case: Password exceeds max length (more than 100 characters)
     */
    @Test
    void testRegister_LongPassword() throws Exception {
        String longPassword = "A".repeat(100) + "1";
        RegisterDTO dto = new RegisterDTO("John Doe", "test@example.com", "+84 123456789", longPassword);

        mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    /**
     * ❌ Abnormal Case: All fields are invalid
     */
    @Test
    void testRegister_AllInvalidFields() throws Exception {
        RegisterDTO dto = new RegisterDTO(
                "",  // Empty fullname
                "invalid-email",  // Invalid email
                "123456",  // Invalid phone
                "short"  // Weak password
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/parent/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }
}
