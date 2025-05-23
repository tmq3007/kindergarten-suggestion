package fa.pjb.back.service;

import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.*;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ParentService {

    RegisterVO saveNewParent(RegisterDTO registerDTO);

    ParentVO editParent(Integer parentId, ParentUpdateDTO parentUpdateDTO, MultipartFile image);

    MediaVO changeAvatar(Integer parentId, MultipartFile image);

    ParentVO getParentById(Integer userId);

    void changePassword(Integer parentId, String oldPassword, String newPassword);

    Page<ParentVO> getAllParent(int page, int size, String searchBy, String keyword, Boolean status);

    Page<ParentVO> getParentBySchool(int page, int size, String searchBy, String keyword);

    Page<ParentVO> getEnrollRequestBySchool(int page,  int size, String searchBy, String keyword);

    Boolean enrollParent(Integer parentInSchoolId);

    Boolean unEnrollParent(Integer parentInSchoolId);

    Boolean rejectParent(Integer parentInSchoolId);


    Integer getSchoolRequestCount();

    List<ParentInSchoolVO> getAcademicHistory(Integer parentId);

    Boolean enrollSchool(Integer schoolId);

    Page<ParentInSchoolDetailVO> getPresentAcademicHistory(int page, int size);

    Page<ParentInSchoolDetailVO> getPreviousAcademicHistory(int page, int size);

}
