package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginDTO(
        @NotBlank(message = "Username cannot be empty")
        String email,

        @Pattern(regexp = ".{3,}", message = "Password must be at least 3 characters long")
        String password
) {
}
