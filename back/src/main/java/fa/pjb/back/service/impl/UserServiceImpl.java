package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.InvalidBRNAlException;
import fa.pjb.back.common.exception._10xx_user.PhoneAlreadyExistedException;
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
import fa.pjb.back.model.vo.MediaVO;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.MediaRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.UserService;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import java.util.stream.Collectors;
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

import static fa.pjb.back.model.enums.ERole.*;
import static fa.pjb.back.model.enums.FileFolderEnum.SO_IMAGES;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/jpg");
    private final GCPFileStorageServiceImpl imageService;
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
    public Boolean checkPhoneExist(String phone) {
        Boolean temp = userRepository.existsByPhone(phone.trim());
        log.info(String.valueOf(temp));
        return temp;
    }

    @Override
    public Boolean checkPhoneExistExcept(String phone, Integer userId) {
        Boolean temp = userRepository.existsByPhoneAndIdNot(phone.trim(), userId);
        log.info("temp:{}",String.valueOf(temp));
        return temp;
    }

    @Override
    public Boolean checkEmailExistExcept(String email, Integer userId){
        Boolean temp = userRepository.existsByEmailAndIdNot(email.trim(), userId);
        log.info("temp:{}",String.valueOf(temp));
        return temp;
    }

    @Override
    public Boolean checkEmailExist(String email) {
        Boolean temp = userRepository.existsByEmail(email.trim());
        log.info(String.valueOf(temp));
        return temp;
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
        // Tìm User theo ID
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Lấy thông tin cơ bản từ User
        UserDetailDTO.UserDetailDTOBuilder builder = UserDetailDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .fullname(user.getFullname())
            .email(user.getEmail())
            .dob(user.getDob() != null ? user.getDob().toString() : "")
            .phone(user.getPhone())
            .role(formatRole(user.getRole()))
            .status(Boolean.TRUE.equals(user.getStatus()));

        // Kiểm tra role và lấy thông tin từ SchoolOwner nếu là ROLE_SCHOOL_OWNER
        if (user.getRole() == ERole.ROLE_SCHOOL_OWNER) {
            SchoolOwner schoolOwner = schoolOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("SchoolOwner not found for user ID: " + userId));

            builder.expectedSchool(schoolOwner.getExpectedSchool())
                .business_registration_number(schoolOwner.getBusiness_registration_number())
                .imageList(schoolOwner.getImages() != null
                    ? schoolOwner.getImages().stream()
                    .map(img -> new MediaVO(img.getUrl(), img.getFilename(), img.getCloudId()))
                    .collect(Collectors.toList())
                    : null);
        } else {
            // Nếu không phải ROLE_SCHOOL_OWNER, các trường bổ sung để null
            builder.expectedSchool(null)
                .business_registration_number(null)
                .imageList(null);
        }

        return builder.build();
    }

    //Covert ERole to String
    private String formatRole(ERole role) {
        return switch (role) {
            case ROLE_PARENT -> "ROLE_PARENT";
            case ROLE_SCHOOL_OWNER -> "ROLE_SCHOOL_OWNER";
            case ROLE_ADMIN -> "ROLE_ADMIN";
        };
    }
    //Covert String Role => ERole
    private ERole convertRole(String role) {
        return switch (role.toUpperCase()) {
            case "ROLE_PARENT" -> ROLE_PARENT;
            case "ROLE_SCHOOL_OWNER" -> ERole.ROLE_SCHOOL_OWNER;
            case "ROLE_ADMIN" -> ERole.ROLE_ADMIN;
            default -> throw new IllegalArgumentException("Invalid role: " + role);
        };
    }

    // Update User Detail
    @Override
    public UserDetailDTO updateUser(UserUpdateDTO dto, List<MultipartFile> imageList) {
        // Tìm user theo ID
        User user = userRepository.findById(dto.id())
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.id()));

        // Kiểm tra email trùng lặp
        if (userRepository.existsByEmailAndIdNot(dto.email(), dto.id())) {
            throw new EmailAlreadyExistedException("Email already exists.");
        }

        // Cập nhật thông tin cơ bản của User
        user.setUsername(dto.username());
        user.setFullname(dto.fullname());
        user.setEmail(dto.email());
        user.setDob(LocalDate.parse(dto.dob())); // Chuyển String thành LocalDate
        user.setPhone(dto.phone());
        user.setRole(convertRole(dto.role())); // Hàm convertRole chuyển String thành ERole
        user.setStatus(dto.status());

        // Xử lý SchoolOwner nếu role là ROLE_SCHOOL_OWNER
        if (dto.role().equals("ROLE_SCHOOL_OWNER")) {
            if (schoolOwnerRepository.existsSchoolOwnerByBusinessRegistrationNumberAndUserIdNot(
                dto.business_registration_number(), dto.id())) {
                throw new InvalidBRNAlException("Business registration number already exists.");
            }

            // Tìm hoặc tạo mới SchoolOwner
            SchoolOwner schoolOwner = schoolOwnerRepository.findByUserId(dto.id())
                .orElseGet(() -> SchoolOwner.builder()
                    .user(user)
                    .publicPermission(true)
                    .assignTime(LocalDate.from(LocalDateTime.now()))
                    .build());

            // Cập nhật thông tin SchoolOwner
            schoolOwner.setExpectedSchool(dto.expectedSchool());
            schoolOwner.setBusiness_registration_number(dto.business_registration_number());

            // Xử lý và lưu ảnh nếu có
            if (imageList != null && !imageList.isEmpty()) {
                processAndSaveFile(imageList, schoolOwner);
            }

            // Lưu SchoolOwner
            schoolOwnerRepository.save(schoolOwner);
        }

        // Lưu User
        userRepository.save(user);

        // Trả về UserDetailDTO
        UserDetailDTO.UserDetailDTOBuilder builder = UserDetailDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .fullname(user.getFullname())
            .email(user.getEmail())
            .dob(user.getDob() != null ? user.getDob().toString() : "")
            .phone(user.getPhone())
            .role(formatRole(user.getRole()))
            .status(Boolean.TRUE.equals(user.getStatus()));

        // Nếu là ROLE_SCHOOL_OWNER, thêm thông tin từ SchoolOwner
        if (user.getRole() == ERole.ROLE_SCHOOL_OWNER) {
            SchoolOwner schoolOwner = schoolOwnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("SchoolOwner not found for user ID: " + user.getId()));

            builder.expectedSchool(schoolOwner.getExpectedSchool())
                .business_registration_number(schoolOwner.getBusiness_registration_number())
                .imageList(schoolOwner.getImages() != null
                    ? schoolOwner.getImages().stream()
                    .map(img -> new MediaVO(img.getUrl(), img.getFilename(), img.getCloudId()))
                    .collect(Collectors.toList())
                    : null);
        } else {
            builder.expectedSchool(null)
                .business_registration_number(null)
                .imageList(null);
        }

        return builder.build();
    }
    // Active or Deactivate user status
    @Override
    public UserDetailDTO toggleStatus(int userId) {
        // Tìm User theo ID
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Đảo ngược trạng thái
        user.setStatus(!Boolean.TRUE.equals(user.getStatus())); // Xử lý trường hợp null
        userRepository.save(user);

        // Trả về UserDetailDTO với builder
        UserDetailDTO.UserDetailDTOBuilder builder = UserDetailDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .fullname(user.getFullname())
            .email(user.getEmail())
            .dob(user.getDob() != null ? user.getDob().toString() : "") // Thay null bằng ""
            .phone(user.getPhone())
            .role(formatRole(user.getRole()))
            .status(Boolean.TRUE.equals(user.getStatus())); // Trả về Boolean

        // Nếu là ROLE_SCHOOL_OWNER, thêm thông tin từ SchoolOwner
        if (user.getRole() == ERole.ROLE_SCHOOL_OWNER) {
            SchoolOwner schoolOwner = schoolOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("SchoolOwner not found for user ID: " + userId));

            builder.expectedSchool(schoolOwner.getExpectedSchool())
                .business_registration_number(schoolOwner.getBusiness_registration_number())
                .imageList(schoolOwner.getImages() != null
                    ? schoolOwner.getImages().stream()
                    .map(img -> new MediaVO(img.getUrl(), img.getFilename(), img.getCloudId()))
                    .collect(Collectors.toList())
                    : null);
        } else {
            builder.expectedSchool(null)
                .business_registration_number(null)
                .imageList(null);
        }

        return builder.build();
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
        Optional<User> existingUserPhone = userRepository.findByPhone(userCreateDTO.phone());

        //Check email exist
        if (existingUserEmail.isPresent()) {
            throw new EmailAlreadyExistedException("Email already exists.");
        }

        // Check if the date of birth is in the past
        if (userCreateDTO.dob() == null || !userCreateDTO.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }

        // Check phone number exist
        if (existingUserPhone.isPresent()) {
            throw new PhoneAlreadyExistedException("Phone already exists.");
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
