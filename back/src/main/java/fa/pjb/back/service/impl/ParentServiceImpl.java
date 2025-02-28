package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.*;
import fa.pjb.back.common.exception.user.UserNotFoundException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.common.exception.user.UserNotCreatedException;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.ParentService;
import fa.pjb.back.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static fa.pjb.back.config.SecurityConfig.passwordEncoder;
import static fa.pjb.back.model.enums.ERole.ROLE_PARENT;

@RequiredArgsConstructor

@Slf4j
@Service
public class ParentServiceImpl implements ParentService {

    private final AuthService authService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final ParentRepository parentRepository;
    private final ParentMapper parentMapper;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AutoGeneratorHelper autoGeneratorHelper;

    @Transactional
    @Override
    public RegisterVO saveNewParent(RegisterDTO registerDTO) throws UserNotCreatedException {
        if (authService.checkEmailExists(registerDTO.email())) {
            throw new UserNotCreatedException("Email already exists");
        }
        try {
            String username = autoGeneratorHelper.generateUsername(registerDTO.fullname());
            User user = User.builder()
                    .email(registerDTO.email())
                    .username(username)
                    .password(passwordEncoder.encode(registerDTO.password()))
                    .role(ROLE_PARENT)
                    .status(true)
                    .fullname(registerDTO.fullname())
                    .phone(registerDTO.phone())
                    .build();
            Parent parent = Parent.builder()
                    .user(user)
                    .build();
//            user.setParent(parent);
            return parentMapper.toRegisterVO(parentRepository.save(parent));
        } catch (Exception e) {
            throw new UserNotCreatedException("Registration failed!" + e);
        }

    }


    @Transactional
    public ParentDTO createParent(ParentDTO parentDTO) {
        // Check if the User already exists
        Optional<User> existingUserEmail = userRepository.findByEmail(parentDTO.email());

        if (existingUserEmail.isPresent()) {
            throw new EmailExistException();
        }
        // Check if email is null or empty first
        if (parentDTO.email() == null || parentDTO.email().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }

        // Check if the date of birth is in the past
        if (parentDTO.dob() == null || !parentDTO.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }

        // Create new User
        String usernameAutoGen = autoGeneratorHelper.generateUsername(parentDTO.fullname());
        String passwordAutoGen = autoGeneratorHelper.generateRandomPassword();


        User newUser = User.builder()
                .email(parentDTO.email())
                .username(usernameAutoGen)
                .password(passwordEncoder.encode(passwordAutoGen))
                .role(ROLE_PARENT)
                .phone(parentDTO.phone())
                .fullname(parentDTO.fullname())
                .status(parentDTO.status())
                .dob(parentDTO.dob())
                .build();

        // Save User to database
        userRepository.save(newUser);

        // Create new Parent
        Parent newParent = Parent.builder()
                .user(newUser)
                // .id(newUser.getId())
                .district(parentDTO.district() != null ? parentDTO.district() : "")
                .ward(parentDTO.ward() != null ? parentDTO.ward() : "")
                .province(parentDTO.province() != null ? parentDTO.province() : "")
                .street(parentDTO.street() != null ? parentDTO.street() : "")
                .build();

        // Save Parent to database
        parentRepository.save(newParent);

        emailService.sendUsernamePassword(parentDTO.email(), parentDTO.fullname(),
                usernameAutoGen, passwordAutoGen);
        return parentMapper.toParentDTO(newParent);
    }

    @Transactional
    public ParentDTO editParent(Integer parentId, ParentDTO parentDTO) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        User user = parent.getUser();

        String newEmail = parentDTO.email() != null ? parentDTO.email() : user.getEmail();
        if (!newEmail.equals(user.getEmail())) {
            Optional<User> existingUserEmail = userRepository.findByEmail(newEmail);
            if (existingUserEmail.isPresent() && !existingUserEmail.get().getId().equals(user.getId())) {
                throw new EmailExistException();
            }
            log.info("email: {}", newEmail);
        }
        // Check if the date of birth is in the past
        if (parentDTO.dob() == null || !parentDTO.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }

        // Update User
        user = User.builder()
                .id(user.getId())
                .username(parentDTO.username())
                .phone(parentDTO.phone())
                .fullname(parentDTO.fullname())
                .status(parentDTO.status())
                .dob(parentDTO.dob())
                .role(ROLE_PARENT)
                .password(user.getPassword())
                .email(newEmail)
                .build();

        // Update Parent
        parent = Parent.builder()
                .id(parentId)
                .district(parentDTO.district())
                .ward(parentDTO.ward())
                .province(parentDTO.province())
                .street(parentDTO.street())
                .user(user)
                .build();
        log.info("parent: {}", parent);
        // save change
       userRepository.save(user);

        parentRepository.save(parent);
        log.info("save parent success");

        // Return ParentDTO
        // Return updated information
        return parentMapper.toParentDTO(parent);
    }

    @Transactional
    public ParentDTO getParentById(Integer parentId) {
        Parent parent = parentRepository.findParentById(parentId);
        if (parent == null) {
            throw new UserNotFoundException();
        }

        return parentMapper.toParentDTO(parent);
    }

    @Transactional
    public void changePassword(Integer parentId, String oldPassword, String newPassword) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(UserNotFoundException::new);

        User user = parent.getUser();

        // Check if the old password is correct
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IncorrectPasswordException();
        }

        // Update new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }


}


