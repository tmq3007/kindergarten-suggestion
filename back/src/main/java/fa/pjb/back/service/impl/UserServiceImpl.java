package fa.pjb.back.service.impl;

import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SchoolOwnerRepository schoolOwnerRepository;
    @Autowired
    private ParentRepository parentRepository;

    @Override
    public Page<UserVO> getAllUsers(Pageable of) {
        Page<User> userEntitiesPage = userRepository.findAll(of);
        return userEntitiesPage.map(this::convertToUserVO);
    }
    private UserVO convertToUserVO(User user) {
        if(user.getRole().equals("0")){
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getParent().getFullname())
                    .build();
        }else if(user.getRole().equals("1")){

        }else{

        }
        return null;
    }
}
