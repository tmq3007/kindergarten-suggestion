package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.EmailExistException;
import fa.pjb.back.common.exception.SchoolNotFoundException;
import fa.pjb.back.common.exception.UsernameExistException;
import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.SchoolOwnerDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.SchoolOwnerService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SchoolOwnerServiceImpl implements SchoolOwnerService {

    private final SchoolOwnerRepository schoolOwnerRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public SchoolOwnerDTO createSchoolOwner(SchoolOwnerDTO dto) {
        // Kiểm tra User có tồn tại không
        Optional<User> existingUserEmail = userRepository.findByEmail(dto.getEmail());
        Optional<User> existingUserName = userRepository.findByUsername(dto.getUsername());

        if (existingUserEmail.isPresent()) {
            throw new EmailExistException();
        }
        if (existingUserName.isPresent()) {
            throw new UsernameExistException();
        }

        // Tạo User mới
        String usernameAutoGen = generateUsername(dto.getFullName());
        String passwordAutoGen = generateRandomPassword();

        User user = new User();
        user.setUsername(usernameAutoGen);
        user.setPassword(passwordEncoder.encode(passwordAutoGen)); // Mã hóa mật khẩu
        user.setEmail(dto.getEmail());
        user.setRole(ERole.ROLE_SCHOOL_OWNER);
        user.setStatus(dto.getStatus());
        user.setPhone(dto.getPhone());
        user.setDob(dto.getDob());

        // Lưu User vào database
        user = userRepository.save(user);

        // Kiểm tra nếu dto.getSchool() != null thì mới tìm trong database
        School school = null;
        if (dto.getSchool() != null && dto.getSchool().getId() != null) {
            school = schoolRepository.findById(dto.getSchool().getId())
                    .orElseThrow(SchoolNotFoundException::new);
        }

        // Tạo SchoolOwner
        SchoolOwner schoolOwner = new SchoolOwner();
        schoolOwner.setUser(user);
        schoolOwner.setFullname(dto.getFullName());
        schoolOwner.setSchool(school); // Chấp nhận null

        // Lưu SchoolOwner vào database
        schoolOwner = schoolOwnerRepository.save(schoolOwner);

        // Gửi email thông báo tài khoản
        emailService.sendUsernamePassword(dto.getEmail(), dto.getFullName(), usernameAutoGen, passwordAutoGen);

        // Tạo response DTO
        SchoolOwnerDTO responseDTO = new SchoolOwnerDTO();
        responseDTO.setId(schoolOwner.getId());
        responseDTO.setUsername(user.getUsername());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setPhone(user.getPhone());
         responseDTO.setFullName(schoolOwner.getFullname());
        responseDTO.setDob(user.getDob());
        responseDTO.setSchool(school != null ? dto.getSchool() : null); // Nếu school null, thì giữ nguyên
        responseDTO.setStatus(user.getStatus());
        responseDTO.setRole(String.valueOf(schoolOwner.getUser().getRole()));

        return responseDTO;
    }


    // Hàm tạo tên username từ Full Name
    private String generateUsername(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Tên không hợp lệ");
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
}
