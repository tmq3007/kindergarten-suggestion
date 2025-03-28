package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotNull;

public record ReviewReportDTO(

    @NotNull(message = "Review ID is required")
    Integer id,

    @NotNull(message = "Reason is required")
    String reason

) {
}
