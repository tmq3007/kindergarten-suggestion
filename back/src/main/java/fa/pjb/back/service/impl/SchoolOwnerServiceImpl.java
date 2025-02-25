package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.*;
import fa.pjb.back.model.dto.SchoolOwnerDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.SOMapper;
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

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SchoolOwnerServiceImpl implements SchoolOwnerService {

    private final SchoolOwnerRepository schoolOwnerRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SOMapper soMapper;

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
        // Kiểm tra số điện thoại có đúng 10 chữ số không
        if (dto.getPhone() == null || !dto.getPhone().matches("\\d{10}")) {
            throw new InvalidPhoneNumberException();
        }

        // Kiểm tra ngày sinh phải là ngày trong quá khứ
        if (dto.getDob() == null || !dto.getDob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }
        // Tạo User mới
        String usernameAutoGen = generateUsername(dto.getFullName());
        String passwordAutoGen = generateRandomPassword();

        User user = User.builder()
                .email(dto.getEmail())
                .username(passwordEncoder.encode(usernameAutoGen))
                .password(passwordAutoGen)
                .role(ERole.ROLE_SCHOOL_OWNER)
                .phone(dto.getPhone())
                .fullname(dto.getFullName())
                .status(dto.getStatus())
                .dob(dto.getDob())
                .build();
        userRepository.save(user);

        // Kiểm tra nếu dto.getSchool() != null thì mới tìm trong database
        School school = null;
        if (dto.getSchool() != null && dto.getSchool().getId() != null) {
            school = schoolRepository.findById(dto.getSchool().getId())
                    .orElseThrow(SchoolNotFoundException::new);
        }

        // Tạo SchoolOwner
        SchoolOwner schoolOwner = new SchoolOwner();
        schoolOwner.setUser(user);
        schoolOwner.setSchool(school); // Chấp nhận null

        // Lưu SchoolOwner vào database
        schoolOwner = schoolOwnerRepository.save(schoolOwner);

        // Gửi email thông báo tài khoản
        emailService.sendUsernamePassword(dto.getEmail(), dto.getFullName(), usernameAutoGen, passwordAutoGen);

        // Trả về DTO
        return soMapper.toSchoolOwner(schoolOwner);
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
