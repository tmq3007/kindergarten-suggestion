package fa.pjb.back.model.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ParentInSchoolVO(

        Integer id,

        ParentVO parent,

        SchoolListVO school,

        LocalDate fromDate,

        LocalDate toDate,

        Byte status,

        Double providedRating,

        String comment

) {
}
