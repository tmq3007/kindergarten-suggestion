package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record ChangeSchoolStatusDTO(

        Byte status
) {
}
