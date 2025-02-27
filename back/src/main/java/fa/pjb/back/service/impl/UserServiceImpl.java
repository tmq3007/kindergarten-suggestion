package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.EmailExistException;
import fa.pjb.back.common.exception.InvalidDateException;
import fa.pjb.back.model.dto.UserDTO;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.UserService;
import java.time.LocalDate;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static fa.pjb.back.model.enums.ERole.*;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public Page<UserVO> getAllUsers(int page,int size, String role, String email, String name, String phone) {
        Pageable pageable =  PageRequest.of(page,size);
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

    // Generate username from fullname
    public String generateUsername(String fullName) {
        String[] parts = fullName.trim().split("\\s+");

        String firstName = parts[parts.length - 1];
        firstName = firstName.substring(0, 1).toUpperCase() + firstName.substring(1).toLowerCase();

        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            initials.append(parts[i].charAt(0));
        }

        String baseUsername = firstName + initials.toString().toUpperCase();

        // Count the number of usernames already existing with this prefix
        long count = userRepository.countByUsernameStartingWith(baseUsername);

        return count == 0 ? baseUsername + 1 : baseUsername + (count + 1);
    }

    // Hàm tạo mật khẩu ngẫu nhiên
    private String generateRandomPassword() {
        return RandomStringUtils.randomAlphanumeric(8) + "a";
    }

    @Override
    public UserDTO createAdmin(UserDTO userDTO) {
        Optional<User> existingUserEmail = userRepository.findByEmail(userDTO.getEmail());

        //check email da ton tai hay chua
        if (existingUserEmail.isPresent()) {
            throw new EmailExistException();
        }
        // Kiểm tra số điện thoại có đúng 10 chữ số không
//        if (userDTO.getPhone() == null || !userDTO.getPhone().matches("\\d{10}")) {
//            throw new InvalidPhoneNumberException();
//        }
        // Kiểm tra ngày sinh phải là ngày trong quá khứ
        if (userDTO.getDob() == null || !userDTO.getDob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }
        // Tạo mới Admin
        String usernameAutoGen = generateUsername(userDTO.getFullName());
        String passwordautoGen = generateRandomPassword();
        User user = new User();
        user.setUsername(usernameAutoGen);
        user.setPassword(passwordEncoder.encode(passwordautoGen)); // Mật khẩu tự tạo
        user.setEmail(userDTO.getEmail());
        user.setRole(ERole.ROLE_ADMIN);
        user.setStatus(userDTO.getStatus());
        user.setPhone(userDTO.getPhone());
        user.setDob(userDTO.getDob());
        user.setFullname(userDTO.getFullName());

        // Lưu User vào database
        user = userRepository.save(user);

        UserDTO responseDTO = new UserDTO();
        responseDTO.setId(user.getId());
        responseDTO.setUsername(user.getUsername());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setRole(String.valueOf(ERole.ROLE_ADMIN));
        responseDTO.setStatus(user.getStatus());
        responseDTO.setPhone(user.getPhone());
        responseDTO.setDob(user.getDob());
        responseDTO.setFullName(user.getFullname());

        emailService.sendUsernamePassword(userDTO.getEmail(), userDTO.getFullName(),
                usernameAutoGen,passwordautoGen);
        return responseDTO;
    }

    // Convert User entity to UserVO
    private UserVO convertToUserVO(User user) {
        // Check if the user role is PARENT
        if (user.getRole() == ROLE_PARENT) {
            Parent temp = parentRepository.findById(user.getId()).orElse(
                    // Default Parent object with empty address fields
                    Parent.builder().street(" ").ward(" ").district(" ").province(" ").build());

            // Combine address fields into a single address string
            String address = temp.getStreet() + " " + temp.getWard() + " " + temp.getDistrict() + " "
                    + temp.getProvince();
            // If the combined address is empty, set it to "N/A"
            if (address.trim().isEmpty()) {
                address = "N/A";
            }

            // Build and return UserVO object for a Parent
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .address(address)
                    .role("Parent")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        }
        // Check if the user role is SCHOOL_OWNER
        else if (user.getRole() == ROLE_SCHOOL_OWNER) {
            // Build and return UserVO object for a School Owner
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .address("N/A")
                    .role("School Owner")
                    .status(user.getStatus() ? "Active" : "Inactive")
                    .build();
        }
        // For other roles (e.g., ADMIN)
        else {
            // Build and return UserVO object for an Admin
            return UserVO.builder()
                    .id(user.getId())
                    .fullname(user.getFullname())
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
