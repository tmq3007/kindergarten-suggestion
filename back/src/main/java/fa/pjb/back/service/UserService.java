package fa.pjb.back.service;

import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.vo.UserVO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserVO> getAllUsers(Pageable of);

    String generateUsername(String fullName);

    UserDetailDTO getUserDetailById(int userId);

    UserDetailDTO updateUser(UserUpdateDTO dto);

    UserDetailDTO toggleStatus(int userId);

}
