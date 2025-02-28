package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.*;
import fa.pjb.back.common.util.AutoGeneratorHelper;
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
import fa.pjb.back.service.UserService;
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
    private final AutoGeneratorHelper autoGeneratorHelper;


    public SchoolOwnerDTO createSchoolOwner(SchoolOwnerDTO dto) {

        // Check user exist
        Optional<User> existingUserEmail = userRepository.findByEmail(dto.email());
        Optional<User> existingUserName = userRepository.findByUsername(dto.username());

        //Check email exist
        if (existingUserEmail.isPresent()) {
            throw new EmailExistException();
        }

        if (existingUserName.isPresent()) {
            throw new UsernameExistException();
        }

        // Check if the date of birth is in the past
        if (dto.dob() == null || !dto.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }
        // Create
        String usernameAutoGen = autoGeneratorHelper.generateUsername(dto.fullName());
        String passwordAutoGen = autoGeneratorHelper.generateRandomPassword();

        User user = User.builder()
                .email(dto.email())
                .username(passwordEncoder.encode(usernameAutoGen))
                .password(passwordAutoGen)
                .role(ERole.ROLE_SCHOOL_OWNER)
                .phone(dto.phone())
                .fullname(dto.fullName())
                .status(Boolean.valueOf(dto.status()))
                .dob(dto.dob())
                .build();
        userRepository.save(user);

        // Check if dto.getSchool() is not null, then search in database
        School school = null;
        if (dto.school() != null && dto.school().id() != null) {
            school = schoolRepository.findById(dto.school().id())
                    .orElseThrow(SchoolNotFoundException::new);
        }

        // Create SchoolOwner
        SchoolOwner schoolOwner = new SchoolOwner();
        schoolOwner.setUser(user);
        schoolOwner.setSchool(school); //accept null

        // Save SchoolOwner to database
        schoolOwner = schoolOwnerRepository.save(schoolOwner);

        // send email with pwd and username
        emailService.sendUsernamePassword(dto.email(), dto.fullName(), usernameAutoGen, passwordAutoGen);

        // return DTO
        return SOMapper.INSTANCE.toSchoolOwner(schoolOwner);
    }
}
