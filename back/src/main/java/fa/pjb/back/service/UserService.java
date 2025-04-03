package fa.pjb.back.service;

import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.UserVO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    Page<UserVO> getAllUsersAdmin(int page, int size, String searchBy, String keyword);

    UserDetailDTO getUserDetailById(int userId);

    UserDetailDTO updateUser(UserUpdateDTO dto, List<MultipartFile> imageList);

    UserDetailDTO toggleStatus(int userId);

    UserCreateDTO createUser(UserCreateDTO userCreateDTO, List<MultipartFile> image);

    User getCurrentUser();

    SchoolOwner getCurrentSchoolOwner();

    Boolean checkPhoneExist(String phone);
}
