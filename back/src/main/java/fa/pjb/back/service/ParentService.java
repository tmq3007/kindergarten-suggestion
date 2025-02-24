package fa.pjb.back.service;

import fa.pjb.back.model.dto.ParentDTO;
import java.util.List;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.RegisterVO;
import jakarta.validation.Valid;

public interface ParentService {
    ParentDTO createParent(ParentDTO parentDTO);

    RegisterVO saveNewParent( RegisterDTO registerDTO);
    void changePassword(Integer parentId, String newPassword);
}
