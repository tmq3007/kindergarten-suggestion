package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ReviewRequestDTO(
        @NotNull(message = "School ID is required")
        Integer schoolId,

        LocalDate fromDate,

        LocalDate toDate
) {
}