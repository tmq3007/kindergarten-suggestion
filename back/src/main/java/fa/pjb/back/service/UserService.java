package fa.pjb.back.service;

import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.vo.UserVO;
import org.springframework.data.domain.Page;

public interface UserService {
    Page<UserVO> getAllUsers(int page, int size, String role, String email, String name, String phone);

    UserDetailDTO getUserDetailById(int userId);

    UserDetailDTO updateUser(UserUpdateDTO dto);

    UserDetailDTO toggleStatus(int userId);

    UserCreateDTO createUser(UserCreateDTO userCreateDTO);

}
