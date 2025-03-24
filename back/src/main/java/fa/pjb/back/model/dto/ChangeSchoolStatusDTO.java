package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record ChangeSchoolStatusDTO(

        Integer schoolId,

        @NotNull(message = "Status cannot be null or empty")
        Byte status

) {
}
