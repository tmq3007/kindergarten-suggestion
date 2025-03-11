package fa.pjb.back.model.dto;

import jakarta.validation.constraints.*;

public record UserUpdateDTO(
    int id,

    @NotBlank(message = "Full Name cannot be null or empty")
    String fullname,

    @NotBlank(message = "Username cannot be null or empty")
    String username,

    @NotBlank(message = "Email cannot be null or empty")
    @Email(message = "Invalid email format. Example: user@example.com")
    String email,

    @NotBlank(message = "Date of Birth cannot be null or empty")
    String dob,

    @NotBlank(message = "Phone number cannot be null or empty")
    @Pattern(regexp = "^\\+\\d{1,4}[-\\s]?\\d{4,14}$", message = "Invalid phone format")
    String phone,

    @NotBlank(message = "Role cannot be null or empty")
    String role,

    @NotBlank(message = "Status cannot be null or empty")
    String status
) {
}
