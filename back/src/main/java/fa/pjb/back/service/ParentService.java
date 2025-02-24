package fa.pjb.back.service;

import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.RegisterVO;
import jakarta.validation.Valid;

public interface ParentService {
    RegisterVO saveNewParent(RegisterDTO registerDTO);
}
