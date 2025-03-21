package fa.pjb.back.model.vo;

import lombok.Builder;

import java.time.LocalDateTime;
@Builder
public record RequestCounsellingVO(
        SchoolDetailVO school,
        String inquiry,
        byte status,
        String email,
        String phone,
        String name,
        LocalDateTime dueDate
) {
}
