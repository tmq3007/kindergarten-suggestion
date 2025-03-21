package fa.pjb.back.service;

import fa.pjb.back.model.vo.RequestCounsellingReminderVO;

public interface RequestCounsellingReminderService {
    void checkDueDateAndSendEmail();
    RequestCounsellingReminderVO checkOverdueForSchoolOwner(Integer userId);
}
