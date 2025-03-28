package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotNull;

public record ReviewAcceptDenyDTO(

        @NotNull(message = "Review ID is required")
        Integer id,

        @NotNull(message = "Decision is required")
        Boolean decision
) {
}
