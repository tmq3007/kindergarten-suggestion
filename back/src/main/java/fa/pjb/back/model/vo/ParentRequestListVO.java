package fa.pjb.back.model.vo;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ParentRequestListVO(

        Integer id,

        SchoolDetailVO school,

        String inquiry,

        byte status,

        String email,

        String phone,

        String name,

        String address,

        LocalDateTime dueDate,

        String response,

        Integer totalSchoolReview,

        Double averageSchoolRating

) {
}
