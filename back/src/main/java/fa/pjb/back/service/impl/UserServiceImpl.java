package fa.pjb.back.service.impl;

import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static fa.pjb.back.model.enums.ERole.*;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthService authService;
    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public Page<UserVO> getAllUsers(Pageable of) {
        Page<User> userEntitiesPage = userRepository.findAll(of);
        return userEntitiesPage.map(this::convertToUserVO);
    }

    @Transactional
    @Override
    public String saveNewUser(RegisterDTO registerDTO) {
        authService.checkEmailExists(registerDTO.email());
        String username = generateUsername(registerDTO.fullname());

        User user = new User();
        user.setEmail(registerDTO.email());
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(registerDTO.password()));
        user.setRole(ROLE_PARENT);
        user.setStatus(true);
        Parent temp = new Parent();
        temp.setUser(user);
        temp.setPhone(registerDTO.phone());
        temp.setFullname(registerDTO.fullname());
        user.setParent(temp);
        userRepository.save(user);
        return "User registered successfully";
    }
    //gen ra username từ fullname
    public String generateUsername(String fullName) {
        String[] parts = fullName.trim().split("\\s+");

        String firstName = parts[parts.length - 1];
        firstName = firstName.substring(0, 1).toUpperCase() + firstName.substring(1).toLowerCase();

        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            initials.append(parts[i].charAt(0));
        }

        String baseUsername = firstName + initials.toString().toUpperCase();

        // đếm số lượng username đã tồn tại với prefix này
        long count = userRepository.countByUsernameStartingWith(baseUsername);

        return count == 0 ? baseUsername+1 : baseUsername + (count + 1);
    }

    private UserVO convertToUserVO(User user) {

        if (user.getRole()== ROLE_PARENT && user.getParent()!=null) {
            Parent temp = user.getParent();
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(temp.getFullname())
                    .email(user.getEmail())
                    .phone(temp.getPhone())
                    .address(temp.getStreet()+" "+temp.getWard()+" "+temp.getDistrict()+" "+temp.getProvince())
                    .role("Parent")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        } else if (user.getRole()== ROLE_SCHOOL_OWNER && user.getSchoolOwner()!=null) {
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
