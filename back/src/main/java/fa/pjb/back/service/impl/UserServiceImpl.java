package fa.pjb.back.service.impl;

import fa.pjb.back.model.entity.Parent;
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

        if (user.getRole().equals("0")) {
            Parent temp = user.getParent();
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(temp.getFullname())
                    .email(user.getEmail())
                    .phone(temp.getPhone()) // Assuming phone is null for Parent
                    .address(temp.getStreet()+temp.getDistrict()+temp.getProvince()+temp.getWard()) // Assuming address is null for Parent
                    .role("Parent")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        } else if (user.getRole().equals("1")) {
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getSchoolOwner().getFullname())
                    .email(user.getEmail())
                    .phone(user.getSchoolOwner().getPhone())
                    .role("School Owner")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        } else {
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getUsername())
                    .email(user.getEmail())
                    .phone("") // Assuming phone is null for generic users
                    .address("") // Assuming address is null for generic users
                    .role("Admin")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        }
    }
}
