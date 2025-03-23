package fa.pjb.back.model.vo;

import lombok.Builder;

import java.time.LocalDate;
@Builder
public record ParentVO(
        Integer id,
        String username,
        String fullname,
        String password,
        String email,
        String role,
        Boolean status,
        String phone,
        LocalDate dob,
        String district,
        String ward,
        String province,
        String street,
        Boolean userEnrollStatus,
        MediaVO media
) {
}
