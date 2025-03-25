package fa.pjb.back.model.vo;

import java.time.LocalDate;

public record SchoolListVO(

        Integer id,

        Byte status,

        String name,

        String district,

        String ward,

        String province,

        String street,

        String email,

        String phone,

        LocalDate postedDate

) {
}
