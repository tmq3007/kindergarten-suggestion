package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

@Builder
public record ChangePasswordDTO(
        @NotBlank(message = "Old password cannot be empty")
        String oldPassword,

        @NotBlank(message = "New password cannot be empty")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).{7,}$",
                message = "New password must have at least one letter, one number, and be at least seven characters long"
        )
        String newPassword
) {
}
