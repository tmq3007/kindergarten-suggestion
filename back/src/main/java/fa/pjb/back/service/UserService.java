package fa.pjb.back.service;

import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.UserVO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserVO> getAllUsers(Pageable of);

    User saveNewUser(@Valid RegisterDTO registerDTO);
}
