package fa.pjb.back.service;

import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.model.vo.RegisterVO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface ParentService {
    RegisterVO saveNewParent( RegisterDTO registerDTO);
    ParentVO editParent(Integer parentId, ParentUpdateDTO parentUpdateDTO, MultipartFile image);
    ParentVO getParentById(Integer userId);
    void changePassword(Integer parentId, String oldPassword, String newPassword);

    Page<ParentVO> getParentByAdmin(int page, int size, String searchBy, String keyword);

    Page<ParentVO> getParentBySchool(int page, int size, String email, String name, String phone, int schoolId);

}
