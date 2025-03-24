package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder
public record FacilityVO(

        Integer fid,

        String name

) {
}
