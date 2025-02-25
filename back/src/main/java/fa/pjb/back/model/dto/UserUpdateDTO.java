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
    @Pattern(regexp = "^0\\d{9}$", message = "Phone number must have 10 digits and start with 0")
    String phone,

    @NotBlank(message = "Role cannot be null or empty")
    String role,

    @NotBlank(message = "Status cannot be null or empty")
    String status
) {
}
