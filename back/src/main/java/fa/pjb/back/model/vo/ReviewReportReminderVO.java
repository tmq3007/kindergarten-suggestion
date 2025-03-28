package fa.pjb.back.model.vo;

 import lombok.Builder;

@Builder
public record ReviewReportReminderVO(

    Integer schoolId,

    String schoolName,

    Integer total
) {
}
