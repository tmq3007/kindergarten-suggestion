package fa.pjb.back.service;

import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;

public interface RequestCounsellingReminderService {
    void checkDueDateAndSendEmail();
    RequestCounsellingReminderVO checkOverdueForSchoolOwner(Integer userId);

}
