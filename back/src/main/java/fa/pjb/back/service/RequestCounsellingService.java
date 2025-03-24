package fa.pjb.back.service;

import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;

public interface RequestCounsellingService {
    RequestCounsellingVO createRequestCounselling(RequestCounsellingDTO request);

    Page<RequestCounsellingVO> getAllRequests(
        int page,
        int size,
        Byte status,
        String email,
        String name,
        String phone,
        String schoolName,
        LocalDateTime dueDate
    );
}
