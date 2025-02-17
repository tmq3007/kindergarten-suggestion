package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class CreateUserDTO {

    @NotBlank(message = "Username cannot be empty")
    private String username;

    @Pattern(regexp = ".{8,}", message = "Password must be at least 8 characters long")
    private String password;
}
