package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.EmailExistException;
import fa.pjb.back.common.exception.InvalidPhoneNumberException;
import fa.pjb.back.model.dto.UserDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.UserMapper;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;


    @Override
    public Page<UserVO> getAllUsers(Pageable of) {
        Page<User> userEntitiesPage = userRepository.findAll(of);
        return userMapper.toUserVOPage(userEntitiesPage);
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

        return count == 0 ? baseUsername + 1 : baseUsername + (count + 1);
    }
    // Hàm tạo mật khẩu ngẫu nhiên
    private String generateRandomPassword() {
        return RandomStringUtils.randomAlphanumeric(8);
    }

    @Override
    public UserDTO createAdmin(UserDTO userDTO) {
        Optional<User> existingUserEmail = userRepository.findByEmail(userDTO.getEmail());
        Optional<User> existingUserName = userRepository.findByUsername(userDTO.getUsername());

        if (existingUserEmail.isPresent()) {
            throw new EmailExistException();
        }
        if (!userDTO.getPhone().matches("\\d{10}")) {
            throw new InvalidPhoneNumberException();
        }
        // Tạo mới Admin
        String usernameAutoGen = generateUsername(userDTO.getFullName());
        String passwordautoGen = generateRandomPassword();
        User user = new User();
        user.setUsername(usernameAutoGen);
        user.setPassword(passwordautoGen);  // Mật khẩu tự tạo
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


        return responseDTO;
    }



}
