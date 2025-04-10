package fa.pjb.back.model.vo;

import lombok.Builder;
import lombok.Getter;

@Builder
public record LoginVO(

        String accessToken,

        String csrfToken,

        Boolean hasSchool,

        Boolean hasDraft

) {
}
