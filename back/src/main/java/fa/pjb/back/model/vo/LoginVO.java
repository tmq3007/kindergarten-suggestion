package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder
public record LoginVO(String accessToken, String csrfToken) {
}
