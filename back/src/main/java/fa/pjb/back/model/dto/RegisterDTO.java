package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterDTO(
        @NotBlank(message = "Fullname cannot be empty")
        String fullname,
        @NotBlank(message = "Email cannot be empty")
        @Pattern(regexp = ".+@.+\\..+", message = "Invalid email format")
        String email,
        @NotBlank(message = "Phone cannot be empty")
        @Pattern(regexp = "^\\+\\d{1,4}[-\\s]?\\d{4,14}$", message = "Invalid phone format")
        String phone,
        @NotBlank(message = "Password cannot be empty")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{7,}$",
                message = "Password must be at least 7 characters long, contain at least one letter, and one number"
        )
        String password
        ) {
}
