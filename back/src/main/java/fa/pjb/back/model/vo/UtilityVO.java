package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder
public record UtilityVO(
        Integer uid,
        String name
) {
}
