package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import org.aspectj.weaver.ast.Not;

public record ResetPasswordDTO(

        @NotBlank
        String password
) {
}
