package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.*;
import fa.pjb.back.common.exception._14xx_data.IncorrectPasswordException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.common.exception._10xx_user.UserNotCreatedException;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.ParentService;
import fa.pjb.back.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

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
            throw new EmailAlreadyExistedException("Email already exists");
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
    public ParentDTO editParent(Integer parentId, ParentDTO parentDTO) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        User user = parent.getUser();

        String newEmail = parentDTO.email() != null ? parentDTO.email() : user.getEmail();
        if (!newEmail.equals(user.getEmail())) {
            Optional<User> existingUserEmail = userRepository.findByEmail(newEmail);
            if (existingUserEmail.isPresent() && !existingUserEmail.get().getId().equals(user.getId())) {
                throw new EmailAlreadyExistedException("Email already exists.");
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
    public ParentVO getParentById(Integer userId) {
        Parent parent = parentRepository.findParentByUserId(userId);
        if (parent == null) {
            throw new UserNotFoundException();
        }

        return parentMapper.toParentVO(parent);
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


