package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordDTO(

        @NotBlank
        String password

) {
}
