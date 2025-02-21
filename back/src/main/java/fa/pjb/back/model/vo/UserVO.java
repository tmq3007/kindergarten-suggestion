package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder
public record UserVO(String Fullname, String Email) {
}
