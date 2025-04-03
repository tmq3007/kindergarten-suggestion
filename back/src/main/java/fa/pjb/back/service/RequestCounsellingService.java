package fa.pjb.back.service;

import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.dto.RequestCounsellingUpdateDTO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import java.util.List;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;

public interface RequestCounsellingService {

    RequestCounsellingVO createRequestCounselling(RequestCounsellingDTO request);

    Page<RequestCounsellingVO> getAllRequests(int page, int size, String searchBy, String keyword);

    RequestCounsellingVO getRequestCounselling(Integer requestCounsellingId);

    void updateRequestCounselling(RequestCounsellingUpdateDTO requestCounsellingUpdateDTO);


}
