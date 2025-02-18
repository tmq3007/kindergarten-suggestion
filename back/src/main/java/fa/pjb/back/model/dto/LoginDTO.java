package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginDTO(
        @NotBlank(message = "Username cannot be empty")
        String username,

        @Pattern(regexp = ".{8,}", message = "Password must be at least 8 characters long")
        String password
) {
}
