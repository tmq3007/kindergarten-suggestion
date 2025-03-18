package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.common.exception._14xx_data.UploadFileException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.UserMapper;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.MediaRepository;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.UserService;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    private final AuthService authService;
    private final EmailService emailService;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AutoGeneratorHelper autoGeneratorHelper;


    @Override
    public Page<UserVO> getAllUsers(int page, int size, String role, String email, String name, String phone) {
        Pageable pageable = PageRequest.of(page - 1, size);
        ERole roleEnum = (role != null && !role.isEmpty()) ? convertRole2(role) : null;

        return userRepository.findAllByCriteria(roleEnum, email, name, phone, pageable);

    }

    private ERole convertRole2(String role) {
        if (role == null || role.trim().isEmpty()) {
            return null;
        }
        return switch (role.toUpperCase()) {
            case "ROLE_PARENT" -> ERole.ROLE_PARENT;
            case "ROLE_SCHOOL_OWNER" -> ERole.ROLE_SCHOOL_OWNER;
            case "ROLE_ADMIN" -> ERole.ROLE_ADMIN;
            case "PARENT", "SCHOOL OWNER", "ADMIN" -> { // Handle both formats for flexibility
                if (role.equalsIgnoreCase("PARENT")) yield ERole.ROLE_PARENT;
                if (role.equalsIgnoreCase("SCHOOL OWNER")) yield ERole.ROLE_SCHOOL_OWNER;
                if (role.equalsIgnoreCase("ADMIN")) yield ERole.ROLE_ADMIN;
                throw new IllegalArgumentException("Invalid role: " + role);
            }
            default -> throw new IllegalArgumentException("Invalid role: " + role);
        };
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
            default -> "Unknown Role";
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

    private void processAndSaveImages(List<MultipartFile> image, SchoolOwner schoolOwner) {
        List<FileUploadVO> imageVOList;

        for (MultipartFile file : image) {
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
                    imageService.convertMultiPartFileToFile(image),
                    "School_Owner_" + schoolOwner.getId() + "Image_",
                    SO_IMAGES,imageService::uploadImage
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
                processAndSaveImages(image, newSO);
            }
        } else if (Objects.equals(userCreateDTO.role(), "ROLE_ADMIN")) {
            user.setRole(ERole.ROLE_ADMIN);
        }

        // Save User to database
        userRepository.save(user);


        //UserCreateDTO responseDTO = userMapper.toUserDTO(user);

        //Check email exist
        if (existingUserEmail.isEmpty()) {
            emailService.sendUsernamePassword(userCreateDTO.email(), userCreateDTO.fullname(),
                    usernameAutoGen, passwordAutoGen);
        }

        return userCreateDTO;
    }

}
