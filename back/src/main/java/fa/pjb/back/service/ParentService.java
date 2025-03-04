package fa.pjb.back.service;

import fa.pjb.back.model.dto.ParentDTO;
import java.util.List;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.model.vo.RegisterVO;
import jakarta.validation.Valid;

public interface ParentService {
    RegisterVO saveNewParent( RegisterDTO registerDTO);
    ParentDTO editParent(Integer parentId, ParentDTO parentDTO);
    ParentVO getParentById(Integer userId);
    void changePassword(Integer parentId, String oldPassword, String newPassword);
}
