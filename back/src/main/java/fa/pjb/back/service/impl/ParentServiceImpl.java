package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.EmailExistException;
import fa.pjb.back.common.exception.UsernameExistException;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.ParentService;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ParentServiceImpl implements ParentService {

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private EmailServiceImpl emailService;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ParentDTO createParent(ParentDTO parentDTO) {
        // Kiểm tra User đã tồn tại chưa
        Optional<User> existingUserEmail = userRepository.findByEmail(parentDTO.getEmail());
        Optional<User> existingUserName = userRepository.findByUsername(parentDTO.getUsername());

//        if (existingUserEmail.isPresent()) {
//            throw new EmailExistException();
//        }
        if (existingUserName.isPresent()){
            throw new UsernameExistException();
        }
        // Tạo mới User
        User user = new User();
        user.setUsername(generateUsername(parentDTO.getFullName(), parentRepository.count() + 1));
        user.setPassword(generateRandomPassword());  // Mật khẩu tự tạo
        user.setEmail(parentDTO.getEmail());
        user.setRole("ROLE_PARENT");
        user.setStatus(parentDTO.getStatus());

        // Lưu User vào database
        user = userRepository.save(user);

        // Tạo Parent mới
        Parent parent = new Parent();
        parent.setUser(user);
        parent.setFullName(parentDTO.getFullName());
        parent.setGender(parentDTO.getGender());
        parent.setPhone(parentDTO.getPhone());
        parent.setDob(parentDTO.getDob());
        parent.setDistrict(parentDTO.getDistrict());
        parent.setWard(parentDTO.getWard());
        parent.setProvince(parentDTO.getProvince());
        parent.setStreet(parentDTO.getStreet());

        // Lưu Parent vào database
        parent = parentRepository.save(parent);

        // Trả về ParentDTO
        ParentDTO responseDTO = new ParentDTO();
        responseDTO.setId(parent.getId());
        responseDTO.setUsername(user.getUsername());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setFullName(parent.getFullName());
        responseDTO.setGender(parent.getGender());
        responseDTO.setPhone(parent.getPhone());
        responseDTO.setDob(parent.getDob());
        responseDTO.setDistrict(parent.getDistrict());
        responseDTO.setWard(parent.getWard());
        responseDTO.setProvince(parent.getProvince());
        responseDTO.setStreet(parent.getStreet());

        emailService.sendUsernamePassword(parentDTO.getEmail(), parentDTO.getFullName(),
                generateUsername(parentDTO.getFullName(), parentRepository.count() + 1),generateRandomPassword());
        return responseDTO;
    }

    // Hàm tạo tên người dùng từ Full Name
    private String generateUsername(String fullName, long id) {
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Tên không hợp lệ");
        }
        String firstName = parts[parts.length - 1];
        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            initials.append(parts[i].charAt(0));
        }
        return firstName + initials.toString().toUpperCase() + id;
    }

    // Hàm tạo mật khẩu ngẫu nhiên
    private String generateRandomPassword() {
        return RandomStringUtils.randomAlphanumeric(8);
    }
}
