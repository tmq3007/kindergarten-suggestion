package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.*;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.common.exception.user.UserNotCreatedException;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.ParentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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


    @Transactional
    @Override
    public RegisterVO saveNewParent(RegisterDTO registerDTO) throws UserNotCreatedException {
        if (authService.checkEmailExists(registerDTO.email())) {
            throw new UserNotCreatedException("Email already exists");
        }
        String username = userService.generateUsername(registerDTO.fullname());
        User user = User.builder()
                .email(registerDTO.email())
                .username(username)
                .password(passwordEncoder.encode(registerDTO.password()))
                .role(ROLE_PARENT)
                .status(true)
                .build();
        Parent parent = Parent.builder()
                .user(user)
                .phone(registerDTO.phone())
                .fullname(registerDTO.fullname())
                .build();
//        user.setParent(parent);
        return parentMapper.toRegisterVO(parentRepository.save(parent));
    }
}

    @Transactional
    public ParentDTO createParent(ParentDTO parentDTO) {
        // Kiểm tra User đã tồn tại chưa
        Optional<User> existingUserEmail = userRepository.findByEmail(parentDTO.getEmail());
        Optional<User> existingUserName = userRepository.findByUsername(parentDTO.getUsername());

        if (existingUserEmail.isPresent()) {
            throw new EmailExistException();
        }
        if (!parentDTO.getPhone().matches("\\d{10}")) {
            throw new InvalidPhoneNumberException();
        }
//        if (existingUserName.isPresent()){
//            throw new UsernameExistException();
//        }
        // Tạo mới User
        String usernameAutoGen = generateUsername(parentDTO.getFullName());
        String passwordautoGen = generateRandomPassword();
        User user = new User();
        user.setUsername(usernameAutoGen);
        user.setPassword(passwordautoGen);  // Mật khẩu tự tạo
        user.setEmail(parentDTO.getEmail());
        user.setRole(ERole.ROLE_PARENT);
        user.setStatus(parentDTO.getStatus());
        user.setPhone(parentDTO.getPhone());
        user.setDob(parentDTO.getDob());
        user.setFullname(parentDTO.getFullName());

        // Lưu User vào database
        user = userRepository.save(user);

        // Tạo Parent mới
        Parent parent = new Parent();
        parent.setUser(user);

        parent.setDistrict(parentDTO.getDistrict() != null ? parentDTO.getDistrict() : "");
        parent.setWard(parentDTO.getWard() != null ? parentDTO.getWard() : "");
        parent.setProvince(parentDTO.getProvince() != null ? parentDTO.getProvince() : "");
        parent.setStreet(parentDTO.getStreet() != null ? parentDTO.getStreet() : "");


        // Lưu Parent vào database
        parent = parentRepository.save(parent);

        // Trả về ParentDTO
        ParentDTO responseDTO = new ParentDTO();
        responseDTO.setId(parent.getId());
        responseDTO.setUsername(user.getUsername());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setFullName(user.getFullname());
        responseDTO.setPhone(user.getPhone());
        responseDTO.setDob(user.getDob());
        responseDTO.setDistrict(parent.getDistrict());
        responseDTO.setWard(parent.getWard());
        responseDTO.setProvince(parent.getProvince());
        responseDTO.setStreet(parent.getStreet());
        responseDTO.setStatus(parent.getUser().getStatus());
        responseDTO.setRole(String.valueOf(parent.getUser().getRole()));

//        emailService.sendUsernamePassword(parentDTO.getEmail(), parentDTO.getFullName(),
//                usernameAutoGen,passwordautoGen);
        return responseDTO;
    }

    @Override
    public RegisterVO saveNewParent(RegisterDTO registerDTO) {
        return null;
    }


    // Hàm tạo tên username từ Full Name
    private String generateUsername(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid Name");
        }

        String firstName = parts[parts.length - 1];
        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            initials.append(parts[i].charAt(0));
        }
        String baseUsername = firstName + initials.toString().toUpperCase();

        // Kiểm tra xem username có bị trùng không
        int count = 1;
        String finalUsername = baseUsername + count;

        while (userRepository.existsUserByUsername(finalUsername)) {
            count++;
            finalUsername = baseUsername + count;
        }

        return finalUsername;
    }


    // Hàm tạo mật khẩu ngẫu nhiên
    private String generateRandomPassword() {
        return RandomStringUtils.randomAlphanumeric(8);
    }


    @Transactional
    public ParentDTO editParent(Integer parentId, ParentDTO parentDTO) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        User user = parent.getUser();

        // Kiểm tra email đã tồn tại chưa (ngoại trừ email của chính User đó)
        Optional<User> existingUserEmail = userRepository.findByEmail(parentDTO.getEmail());
        if (existingUserEmail.isPresent() && !existingUserEmail.get().getId().equals(user.getId())) {
            throw new EmailExistException();
        }

        // Cập nhật thông tin User
        user.setEmail(parentDTO.getEmail());
        user.setUsername(parentDTO.getUsername());  // Cập nhật username nếu có thay đổi
        user.setPhone(parentDTO.getPhone());
        user.setDob(parentDTO.getDob());

        user.setFullname(parentDTO.getFullName());
        // Cập nhật thông tin Parent

        // Lưu thay đổi
        userRepository.save(user);
        parentRepository.save(parent);

        // Trả về ParentDTO
        ParentDTO responseDTO = new ParentDTO();
        responseDTO.setId(parent.getId());
        responseDTO.setUsername(user.getUsername());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setFullName(user.getFullname());
        responseDTO.setPhone(user.getPhone());
        responseDTO.setDob(user.getDob());
        responseDTO.setDistrict(parent.getDistrict());
        responseDTO.setWard(parent.getWard());
        responseDTO.setProvince(parent.getProvince());
        responseDTO.setStreet(parent.getStreet());
        responseDTO.setStatus(parent.getUser().getStatus());
        responseDTO.setRole(String.valueOf(parent.getUser().getRole()));

        // Trả về thông tin đã cập nhật
        return  responseDTO;
    }

    @Transactional
    public ParentDTO getParentById(Integer parentId) {
        Parent parent = parentRepository.findParentById(parentId);
        if (parent == null) {
            throw new UserNotFoundException();
        }

        User user = parent.getUser();

        ParentDTO responseDTO = new ParentDTO();
        responseDTO.setId(parent.getId());
        responseDTO.setUsername(user.getUsername());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setFullName(user.getFullname());
        responseDTO.setPhone(user.getPhone());
        responseDTO.setDob(user.getDob());
        responseDTO.setDistrict(parent.getDistrict());
        responseDTO.setWard(parent.getWard());
        responseDTO.setProvince(parent.getProvince());
        responseDTO.setStreet(parent.getStreet());
        responseDTO.setStatus(user.getStatus());
        responseDTO.setRole(String.valueOf(user.getRole()));

        return responseDTO;
    }

    @Transactional
    public void changePassword(Integer parentId, String oldPassword, String newPassword) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(UserNotFoundException::new);
        log.info("parent: {}", parent);

        User user = parent.getUser();
        log.info("user: {}", user.getPassword());

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IncorrectPasswordException();
        }

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }




}
