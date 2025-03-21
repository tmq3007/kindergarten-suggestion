package fa.pjb.back.service;

import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.vo.RequestCounsellingVO;

public interface RequestCounsellingService {
    RequestCounsellingVO createRequestCounselling(RequestCounsellingDTO request);
}
