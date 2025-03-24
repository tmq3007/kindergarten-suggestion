package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder
public record UserVO(
    int id,
    String fullname,
    String email,
    String phone,
    String address,
    String role,
    String status
) {
}
