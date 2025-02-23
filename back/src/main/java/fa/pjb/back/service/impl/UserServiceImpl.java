package fa.pjb.back.service.impl;

import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.ParentRepository;
 import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import static fa.pjb.back.model.enums.ERole.*;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
     private ParentRepository parentRepository;

    @Override
    public Page<UserVO> getAllUsers(Pageable of) {
        Page<User> userEntitiesPage = userRepository.findAll(of);
        return userEntitiesPage.map(this::convertToUserVO);
    }
    public void save(User user) {
        userRepository.save(user);
    }

    private UserVO convertToUserVO(User user) {

        if (user.getRole()== ROLE_PARENT) {
            Parent temp = user.getParent();
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(temp.getFullName())
                    .email(user.getEmail())
                    .phone(temp.getPhone())
                    .address(temp.getStreet()+" "+temp.getWard()+" "+temp.getDistrict()+" "+temp.getProvince())
                    .role("Parent")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        } else if (user.getRole()== ROLE_SCHOOL_OWNER) {
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getSchoolOwner().getFullname())
                    .email(user.getEmail())
                    .phone(user.getSchoolOwner().getPhone())
                    .address("N/A")
                    .role("School Owner")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        } else {
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getUsername())
                    .email(user.getEmail())
                    .phone("N/A")
                    .address("N/A")
                    .role("Admin")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        }
    }
}
