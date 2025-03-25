package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

@Builder
public record LoginDTO(

        @NotBlank(message = "Username cannot be empty")
        @Pattern(
                regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                message = "Invalid email format"
        )
        String email,

        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{7,}$",
                message = "Password must have at least one letter, one number, and be at least seven characters long")
        String password

) {
}
