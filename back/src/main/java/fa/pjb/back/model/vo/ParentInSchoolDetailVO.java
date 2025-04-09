package fa.pjb.back.model.vo;

import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record ParentInSchoolDetailVO(

        Integer id,

        SchoolSearchVO school,

        LocalDate fromDate,

        LocalDate toDate,

        Byte status,

        Integer totalSchoolReview,

        Double averageSchoolRating,

        Double providedRating,

        String comment,

        Boolean hasEditCommentPermission

) {
}
