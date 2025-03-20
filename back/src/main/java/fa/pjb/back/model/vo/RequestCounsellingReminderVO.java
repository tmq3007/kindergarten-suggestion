package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder

public record RequestCounsellingReminderVO(

    String title,
    String description
) {

}
