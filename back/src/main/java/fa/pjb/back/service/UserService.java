package fa.pjb.back.service;

import fa.pjb.back.model.vo.UserVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserVO> getAllUsers(Pageable of);

    String generateUsername(String fullName);
}
