package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder
public record MediaVO(

        String url,

        String filename,

        String cloudId

) {
}
