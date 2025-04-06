package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotNull;

public record RequestCounsellingUpdateDTO(

        @NotNull
        Integer requestCounsellingId,

        String response
) {
}
