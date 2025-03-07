package fa.pjb.back.service;

import fa.pjb.back.model.dto.ParentDTO;
import java.util.List;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.model.vo.RegisterVO;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

public interface ParentService {
    RegisterVO saveNewParent( RegisterDTO registerDTO);
    ParentVO editParent(Integer parentId, ParentDTO parentDTO, MultipartFile image);
    ParentVO getParentById(Integer userId);
    void changePassword(Integer parentId, String oldPassword, String newPassword);
}
