package fa.pjb.back.service;

import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;

public interface RequestCounsellingReminderService {

    void checkDueDateAndSendEmail();

    RequestCounsellingReminderVO checkOverdueForSchoolOwner(Integer userId);

    Page<RequestCounsellingVO> getAllReminder(int page, int size, List<Byte> statuses, String searchBy, String keyword);

    Page<RequestCounsellingVO> getRemindersBySchoolOwner(int page, int size, Integer schoolOwnerId, List<Byte> statuses);


}
