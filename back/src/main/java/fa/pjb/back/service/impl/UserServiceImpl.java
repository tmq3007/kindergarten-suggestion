package fa.pjb.back.service.impl;

import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.UserMapper;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import static fa.pjb.back.model.enums.ERole.*;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;


    @Override
    public Page<UserVO> getAllUsers(Pageable of) {
        Page<User> userEntitiesPage = userRepository.findAll(of);
        return userEntitiesPage.map(this::convertToUserVO);
    }

    //generate username từ fullname
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

        if (user.getRole()== ROLE_PARENT ) {
            Parent temp = parentRepository.getReferenceById(user.getId());
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .address(temp.getStreet()+" "+temp.getWard()+" "+temp.getDistrict()+" "+temp.getProvince())
                    .role("Parent")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        } else if (user.getRole()== ROLE_SCHOOL_OWNER) {
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .phone(user.getPhone())
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

    @Override
    public UserDetailDTO getUserDetailById(int userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        return new UserDetailDTO(
            user.getId(),
            user.getUsername(),
            user.getFullname(),
            user.getEmail(),
            user.getDob() != null ? user.getDob().toString() : null,
            user.getPhone(),
            formatRole(user.getRole()),
            user.getStatus() ? "Active" : "Inactive"
        );

    }

    private String formatRole(ERole role) {
        switch (role) {
            case ROLE_PARENT:
                return "Parent";
            case ROLE_SCHOOL_OWNER:
                return "School Owner";
            case ROLE_ADMIN:
                return "Admin";
            default:
                return "Unknown Role";
        }
    }

    //Chuyển role ra đúng format
    private ERole convertRole(String role) {
        return switch (role.toUpperCase()) {
            case "PARENT" -> ERole.ROLE_PARENT;
            case "SCHOOL OWNER" -> ERole.ROLE_SCHOOL_OWNER;
            case "ADMIN" -> ERole.ROLE_ADMIN;
            default -> throw new IllegalArgumentException("Invalid role: " + role);
        };
    }

    //Update UserDetail
    @Override
    public UserDetailDTO updateUser(UserUpdateDTO dto) {
        User user = userRepository.findById(dto.id())
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.id()));

        if (userRepository.existsByEmailAndIdNot(dto.email(), dto.id())) {
            throw new RuntimeException("Email already exists!");
        }
        if (userRepository.existsByPhoneAndIdNot(dto.phone(), dto.id())) {
            throw new RuntimeException("Phone number already exists!");
        }

        user.setFullname(dto.fullname());
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setDob(LocalDate.parse(dto.dob()));
        user.setPhone(dto.phone());
        user.setRole(convertRole(dto.role()));
        user.setStatus(dto.status().equalsIgnoreCase("ACTIVE"));

        userRepository.save(user);

        return new UserDetailDTO(
            user.getId(), user.getUsername(), user.getFullname(), user.getEmail(),
            user.getDob().toString(), user.getPhone(), formatRole(user.getRole()),
            user.getStatus() ? "Active" : "Inactive"
        );
    }

    //Active hoặc Deactive
    @Override
    public UserDetailDTO toggleStatus(int userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setStatus(!user.getStatus());
        userRepository.save(user);

        return new UserDetailDTO(
            user.getId(),
            user.getUsername(),
            user.getFullname(),
            user.getEmail(),
            user.getDob() != null ? user.getDob().toString() : null,
            user.getPhone(),
            formatRole(user.getRole()),
            user.getStatus() ? "Active" : "Inactive"
        );
    }



}
