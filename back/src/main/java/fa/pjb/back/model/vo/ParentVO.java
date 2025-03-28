package fa.pjb.back.model.vo;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record ParentVO(
        Integer id,
        Integer userId,
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
        MediaVO media,
        ParentInSchoolVO pis,
        List<ParentInSchoolVO> pisList
) {
}
