package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.UserDTO;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.UserMapper;
import fa.pjb.back.model.mapper.UserProjection;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.UserService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static fa.pjb.back.model.enums.ERole.*;
@Slf4j
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final SchoolOwnerRepository schoolOwnerRepository;
    private final AuthService authService;
    private final EmailService emailService;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AutoGeneratorHelper autoGeneratorHelper;


    @Override
    public Page<UserVO> getAllUsers(int page, int size, String role, String email, String name, String phone) {
        Pageable pageable = PageRequest.of(page-1, size);
        ERole roleEnum = (role != null && !role.isEmpty()) ? convertRole2(role) : null;

        Page<UserProjection> userEntitiesPage = userRepository.findAllByCriteria(roleEnum, email, name, phone, pageable);
        return userEntitiesPage.map(userMapper::toUserVOFromProjection);
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
                Boolean.TRUE.equals(user.getStatus()) ? "Active" : "Inactive");
    }
  //Covert ERole to String
  private String formatRole(ERole role) {
    return switch (role) {
      case ROLE_PARENT -> "Parent";
      case ROLE_SCHOOL_OWNER -> "School Owner";
      case ROLE_ADMIN -> "Admin";
      default -> "Unknown Role";
    };
  }

  //Covert String Role => ERole
  private ERole convertRole(String role) {
    return switch (role.toUpperCase()) {
      case "PARENT" -> ROLE_PARENT;
      case "SCHOOL OWNER" -> ERole.ROLE_SCHOOL_OWNER;
      case "ADMIN" -> ERole.ROLE_ADMIN;
      default -> throw new IllegalArgumentException("Invalid role: " + role);
    };
  }

  // Update User Detail
  @Override
  public UserDetailDTO updateUser(UserUpdateDTO dto) {
    User user = userRepository.findById(dto.id())
        .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.id()));

    if (userRepository.existsByEmailAndIdNot(dto.email(), dto.id())) {
      throw new EmailAlreadyExistedException("Email already exists.");
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
        Boolean.TRUE.equals(user.getStatus()) ? "Active" : "Inactive");
  }

  // Active or Deactivate user status
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
        Boolean.TRUE.equals(user.getStatus()) ? "Active" : "Inactive");
  }

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        Optional<User> existingUserEmail = userRepository.findByEmail(userDTO.email());

        //Check email exist
        if (existingUserEmail.isPresent()) {
            throw new EmailAlreadyExistedException("Email already exists.");
        }

        // Check if the date of birth is in the past
        if (userDTO.dob() == null || !userDTO.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }
        // Create User
        String usernameAutoGen = autoGeneratorHelper.generateUsername(userDTO.fullname());
        String passwordAutoGen = autoGeneratorHelper.generateRandomPassword();
        User user =User.builder()
                .username(usernameAutoGen)
                .password(passwordEncoder.encode(passwordAutoGen))
                .phone(userDTO.phone())
                .fullname(userDTO.fullname())
                .status(Boolean.valueOf(userDTO.status()))
                .dob(userDTO.dob())
                .email(userDTO.email())
                .build();
        if(Objects.equals(userDTO.role(), "ROLE_PARENT")) {
            user.setRole(ERole.ROLE_PARENT);

            // Create new Parent
            Parent newParent = Parent.builder()
                    .user(user)
                     .district("")
                    .ward("")
                    .province("")
                    .street("")
                    .media(null)
                    .build();

            // Save Parent to database
            parentRepository.save(newParent);
        } else if(Objects.equals(userDTO.role(), "ROLE_SCHOOL_OWNER")) {
            user.setRole(ERole.ROLE_SCHOOL_OWNER);

            // Create SchoolOwner
            SchoolOwner schoolOwner = SchoolOwner.builder()
                    .user(user)
                    .school(null)
                    .assignTime(LocalDate.from(LocalDateTime.now()))
                    .build();

            // Save SchoolOwner to database
            schoolOwnerRepository.save(schoolOwner);
        } else if(Objects.equals(userDTO.role(), "ROLE_ADMIN")) {
            user.setRole(ERole.ROLE_ADMIN);
        }

        // Save User to database
        userRepository.save(user);

        UserDTO responseDTO = userMapper.toUserDTO(user);

        emailService.sendUsernamePassword(userDTO.email(), userDTO.fullname(),
                usernameAutoGen,passwordAutoGen);
        return responseDTO;
    }

}
