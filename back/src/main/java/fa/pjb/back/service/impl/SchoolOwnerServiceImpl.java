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
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchoolOwnerServiceImpl implements SchoolOwnerService {

    private final SchoolOwnerRepository schoolOwnerRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AutoGeneratorHelper autoGeneratorHelper;
    private final SOMapper soMapper;

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
        String usernameAutoGen = autoGeneratorHelper.generateUsername(dto.fullname());
        String passwordAutoGen = autoGeneratorHelper.generateRandomPassword();

        User user = User.builder()
                .id(dto.id())
                .email(dto.email())
                .username(usernameAutoGen)
                .password(passwordAutoGen)
                .role(ERole.ROLE_SCHOOL_OWNER)
                .phone(dto.phone())
                .fullname(dto.fullname())
                .status(Boolean.valueOf(dto.status()))
                .dob(dto.dob())
                .build();
        log.info("User created: {}", user);
        userRepository.save(user);


        // Check if dto.getSchool() is not null, then search in database
        School school = null;
        if (dto.school() != null && dto.school().id() != null) {
            school = schoolRepository.findById(dto.school().id())
                    .orElseThrow(SchoolNotFoundException::new);
        }

        // Create SchoolOwner
        SchoolOwner schoolOwner = SchoolOwner.builder()
                .id(dto.id())
                .user(user)
                .school(school)
                .build();

        // Save SchoolOwner to database
        schoolOwner = schoolOwnerRepository.save(schoolOwner);

        // send email with pwd and username
        emailService.sendUsernamePassword(dto.email(), dto.fullname(), usernameAutoGen, passwordAutoGen);

        // return DTO
        return soMapper.toSchoolOwner(schoolOwner);
    }
}
