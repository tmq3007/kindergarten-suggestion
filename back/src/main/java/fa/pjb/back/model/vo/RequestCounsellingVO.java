package fa.pjb.back.model.vo;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record RequestCounsellingVO(

        Integer id,

        String schoolName,

        String inquiry,

        byte status,

        String email,

        String phone,

        String name,

        String address,

        LocalDateTime dueDate,

        String response

) {
}
