package fa.pjb.back.model.vo;

import java.time.LocalDate;

public record ParentInSchoolVO(
        Integer id,
        ParentVO parent,
        SchoolListVO school,
        LocalDate startDate,
        LocalDate endDate,
        String status
) {
}
