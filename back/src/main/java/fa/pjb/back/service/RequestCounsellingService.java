package fa.pjb.back.service;

import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.dto.RequestCounsellingUpdateDTO;
import fa.pjb.back.model.vo.ParentRequestListVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import java.util.List;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;

public interface RequestCounsellingService {

    RequestCounsellingVO createRequestCounselling(RequestCounsellingDTO request);

    Page<RequestCounsellingVO> getAllRequests(int page, int size, String searchBy, String keyword);

    RequestCounsellingVO getRequestCounsellingByAdmin(Integer requestCounsellingId);

    RequestCounsellingVO getRequestCounsellingBySchoolOwner(Integer requestCounsellingId);

    void updateRequestCounsellingByAdmin(RequestCounsellingUpdateDTO requestCounsellingUpdateDTO);

    void updateRequestCounsellingBySchoolOwner(RequestCounsellingUpdateDTO requestCounsellingUpdateDTO);

    Page<ParentRequestListVO> getAllRequestsByParent(int page, int size);
}
