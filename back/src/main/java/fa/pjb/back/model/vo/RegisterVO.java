package fa.pjb.back.model.vo;

import java.time.LocalDateTime;

public record RegisterVO(
        String fullname,
        String email,
        String phone,
        LocalDateTime registrationDate
) {
}