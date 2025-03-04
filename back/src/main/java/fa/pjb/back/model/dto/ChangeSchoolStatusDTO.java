package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record ChangeSchoolStatusDTO(

        @NotBlank(message = "Username cannot be empty")
        String username,

        Byte status
) {
}
