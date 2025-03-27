package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.BRNAlreadyExistedException;
import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.common.exception._14xx_data.UploadFileException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.UserMapper;
import fa.pjb.back.model.mapper.UserProjection;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.MediaRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static fa.pjb.back.model.enums.ERole.*;
import static fa.pjb.back.model.enums.FileFolderEnum.SO_IMAGES;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/jpg");
    private final GGDriveImageService imageService;
    private static final Tika tika = new Tika();
    private final MediaRepository mediaRepository;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final SchoolOwnerRepository schoolOwnerRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AutoGeneratorHelper autoGeneratorHelper;

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // Check if principal is an instance of User entity
        if (principal instanceof User user) {
            return user;
        } else {
            throw new AuthenticationFailedException("Cannot authenticate");
        }
    }

    public SchoolOwner getCurrentSchoolOwner() {
        User user = getCurrentUser();
        return schoolOwnerRepository.findWithSchoolAndDraftByUserId(user.getId())
                .orElseThrow(UserNotFoundException::new);
    }

    @Override
    public Page<UserVO> getAllUsersAdmin(int page, int size, String searchBy, String keyword) {
        Pageable pageable = PageRequest.of(page - 1, size);
        if (!Arrays.asList("username", "fullname", "email", "phone").contains(searchBy)) {
            throw new InvalidDataException("Invalid searchBy value: " + searchBy);
        }
        List<ERole> roleList = Arrays.asList(ROLE_ADMIN, ROLE_SCHOOL_OWNER);
        Page<UserProjection> userEntitiesPage = userRepository.findAllByCriteria(roleList, searchBy, keyword, pageable);
        return userEntitiesPage.map(userMapper::toUserVOFromProjection);
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

    private void processAndSaveFile(List<MultipartFile> files, SchoolOwner schoolOwner) {
        List<FileUploadVO> imageVOList;

        for (MultipartFile file : files) {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new InvalidFileFormatException("File cannot exceed 5MB");
            }
            try {
                String mimeType = tika.detect(file.getBytes());
                if (!ALLOWED_MIME_TYPES.contains(mimeType)) {
                    throw new InvalidFileFormatException("Invalid file type: " + file.getOriginalFilename() + ". Allowed: JPEG, PNG, JPG.");
                }
            } catch (IOException e) {
                throw new InvalidFileFormatException("Error when processing file");
            }
        }

        try {
            imageVOList = imageService.uploadListFiles(
                    imageService.convertMultiPartFileToFile(files),
                    "School_Owner_" + schoolOwner.getId() + "Image_",
                    SO_IMAGES, imageService::uploadFile
            );
        } catch (IOException e) {
            throw new UploadFileException("Error while uploading images: " + e.getMessage());
        }
        List<Media> mediaList = new ArrayList<>();
        for (FileUploadVO imageVO : imageVOList) {
            if (imageVO.status() == 200) {
                Media media = Media.builder()
                        .url(imageVO.url())
                        .size(String.valueOf(imageVO.size()))
                        .cloudId(imageVO.fileId())
                        .filename(imageVO.fileName())
                        .type("image/png")
                        .uploadTime(LocalDate.now())
                        .schoolOwner(schoolOwner)
                        .build();
                mediaList.add(media);
            }
        }
        mediaRepository.saveAll(mediaList);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    public UserCreateDTO createUser(UserCreateDTO userCreateDTO, List<MultipartFile> image) {
        if (userCreateDTO.email() == null || userCreateDTO.email().isBlank()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        Optional<User> existingUserEmail = userRepository.findByEmail(userCreateDTO.email());

        //Check email exist
        if (existingUserEmail.isPresent()) {
            throw new EmailAlreadyExistedException("Email already exists.");
        }

        // Check if the date of birth is in the past
        if (userCreateDTO.dob() == null || !userCreateDTO.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }

        if (schoolOwnerRepository.existsSchoolOwnerByBusinessRegistrationNumber(userCreateDTO.business_registration_number())) {
            throw new BRNAlreadyExistedException("Business registration number already exists.");
        }

        // Create User
        String usernameAutoGen = autoGeneratorHelper.generateUsername(userCreateDTO.fullname());
        String passwordAutoGen = autoGeneratorHelper.generateRandomPassword();
        User user = User.builder()
                .username(usernameAutoGen)
                .password(passwordEncoder.encode(passwordAutoGen))
                .phone(userCreateDTO.phone())
                .fullname(userCreateDTO.fullname())
                .status(userCreateDTO.status())
                .dob(userCreateDTO.dob())
                .email(userCreateDTO.email())
                .build();
        if (Objects.equals(userCreateDTO.role(), "ROLE_SCHOOL_OWNER")) {
            user.setRole(ERole.ROLE_SCHOOL_OWNER);


            // Create SchoolOwner
            SchoolOwner schoolOwner = SchoolOwner.builder()
                    .user(user)
                    .expectedSchool(userCreateDTO.expectedSchool())
                    .publicPermission(true)
                    .school(null)
                    .assignTime(LocalDate.from(LocalDateTime.now()))
                    .business_registration_number(userCreateDTO.business_registration_number())
                    .build();

            // Save SchoolOwner to database
            SchoolOwner newSO = schoolOwnerRepository.save(schoolOwner);

            // Validate and upload images (if provided)
            if (image != null && !image.isEmpty()) {
                processAndSaveFile(image, newSO);
            }
        } else if (Objects.equals(userCreateDTO.role(), "ROLE_ADMIN")) {
            user.setRole(ERole.ROLE_ADMIN);
        }

        // Save User to database
        userRepository.save(user);

        //UserCreateDTO responseDTO = userMapper.toUserDTO(user);

        //Check email exist
        emailService.sendUsernamePassword(userCreateDTO.email(), userCreateDTO.fullname(),
                usernameAutoGen, passwordAutoGen);

        return userCreateDTO;
    }

}
