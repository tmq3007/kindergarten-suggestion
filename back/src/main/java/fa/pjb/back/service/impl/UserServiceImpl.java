package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.EmailExistException;
import fa.pjb.back.common.exception.InvalidDateException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.UserDTO;
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
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.UserService;
import java.time.LocalDate;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static fa.pjb.back.model.enums.ERole.*;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final EmailService emailService;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AutoGeneratorHelper autoGeneratorHelper;


    @Override
    public Page<UserVO> getAllUsers(Pageable pageable, String role, String email, String name, String phone) {
        ERole roleEnum = null;
        if (role != null && !role.isEmpty()) {
            roleEnum = convertRole2(role); // Convert the String role to ERole
        }
        Page<User> userEntitiesPage = userRepository.findAllByCriteria(
                roleEnum, email, name, phone, pageable
        );
        return userEntitiesPage.map(this::convertToUserVO);
    }

    private ERole convertRole2(String role) {
        if (role == null || role.trim().isEmpty()) {
            return null;
        }
        return switch (role.toUpperCase()) {
            case "ROLE_PARENT" -> ERole.ROLE_PARENT;
            case "ROLE_SCHOOL_OWNER" -> ERole.ROLE_SCHOOL_OWNER;
            case "ROLE_ADMIN" -> ERole.ROLE_ADMIN;
            case "PARENT", "SCHOOL OWNER", "ADMIN" -> { // Handle both formats for flexibility
                if (role.equalsIgnoreCase("PARENT")) yield ERole.ROLE_PARENT;
                if (role.equalsIgnoreCase("SCHOOL OWNER")) yield ERole.ROLE_SCHOOL_OWNER;
                if (role.equalsIgnoreCase("ADMIN")) yield ERole.ROLE_ADMIN;
                throw new IllegalArgumentException("Invalid role: " + role);
            }
            default -> throw new IllegalArgumentException("Invalid role: " + role);
        };
    }

    @Override
    public UserDTO createAdmin(UserDTO userDTO) {
        Optional<User> existingUserEmail = userRepository.findByEmail(userDTO.email());

        //Check email exist
        if (existingUserEmail.isPresent()) {
            throw new EmailExistException();
        }

        // Check if the date of birth is in the past
        if (userDTO.dob() == null || !userDTO.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }
        // Create Admin
        String usernameAutoGen = autoGeneratorHelper.generateUsername(userDTO.username());
        String passwordAutoGen = autoGeneratorHelper.generateRandomPassword();
        User user =User.builder()
                .username(usernameAutoGen)
                .password(passwordAutoGen)
                .role(ERole.ROLE_ADMIN)
                .phone(userDTO.phone())
                .fullname(userDTO.fullName())
                .status(Boolean.valueOf(userDTO.status()))
                .dob(userDTO.dob())
                .email(userDTO.email())
                .build();

        // Save User to database
        user = userRepository.save(user);

        UserDTO responseDTO = UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(String.valueOf(ERole.ROLE_ADMIN))
                .status(String.valueOf(user.getStatus()))
                .phone(user.getPhone())
                .dob(user.getDob())
                .fullName(user.getFullname())
                .build();

        emailService.sendUsernamePassword(userDTO.email(), userDTO.fullName(),
                usernameAutoGen,passwordAutoGen);
        return responseDTO;
    }

    private UserVO convertToUserVO(User user) {

        if (user.getRole() == ROLE_PARENT) {
            Parent temp = parentRepository.findById(user.getId()).orElse(
                    Parent.builder().street(" ").ward(" ").district(" ").province(" ").build());

            //nếu address rỗng thì gán là N/A
            String address = temp.getStreet() + " " + temp.getWard() + " " + temp.getDistrict() + " "
                    + temp.getProvince();
            if (address.trim().isEmpty()) {
                address = "N/A";
            }
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .address(address)
                    .role("Parent")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        } else if (user.getRole() == ROLE_SCHOOL_OWNER) {
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
                user.getStatus() ? "Active" : "Inactive");

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

    // Chuyển role ra đúng format
    private ERole convertRole(String role) {
        return switch (role.toUpperCase()) {
            case "PARENT" -> ROLE_PARENT;
            case "SCHOOL OWNER" -> ERole.ROLE_SCHOOL_OWNER;
            case "ADMIN" -> ERole.ROLE_ADMIN;
            default -> throw new IllegalArgumentException("Invalid role: " + role);
        };
    }

    // Update UserDetail
    @Override
    public UserDetailDTO updateUser(UserUpdateDTO dto) {
        User user = userRepository.findById(dto.id())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.id()));

        if (userRepository.existsByEmailAndIdNot(dto.email(), dto.id())) {
            throw new EmailExistException();
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
                user.getStatus() ? "Active" : "Inactive");
    }

    // Active hoặc Deactive
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
                user.getStatus() ? "Active" : "Inactive");
    }

}
