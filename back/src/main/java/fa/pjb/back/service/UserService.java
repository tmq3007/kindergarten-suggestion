package fa.pjb.back.service;

import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.dto.UserDTO;
import fa.pjb.back.model.vo.UserVO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserVO> getAllUsers(int page, int size, String role, String email, String name, String phone);

    UserDTO createAdmin(UserDTO userDTO);

    UserDetailDTO getUserDetailById(int userId);

    UserDetailDTO updateUser(UserUpdateDTO dto);

    UserDetailDTO toggleStatus(int userId);

    UserDTO createUser(UserDTO userDTO);

}
