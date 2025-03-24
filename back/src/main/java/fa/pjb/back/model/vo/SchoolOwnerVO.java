package fa.pjb.back.model.vo;

import java.time.LocalDate;
import java.util.List;

public record SchoolOwnerVO(

        Integer id,

        Integer userId,

        String fullname,

        String username,

        String email,

        String phone,

        String expectedSchool,

        List<MediaVO> imageList,

        LocalDate dob

) {
}
