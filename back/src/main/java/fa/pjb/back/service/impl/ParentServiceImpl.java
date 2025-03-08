package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.*;
import fa.pjb.back.common.exception._14xx_data.IncorrectPasswordException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.common.exception._10xx_user.UserNotCreatedException;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.FileFolderEnum;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.ImageVO;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Optional;

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
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AutoGeneratorHelper autoGeneratorHelper;
    private final GGDriveImageService ggDriveImageService;

    @Transactional
    @Override
    public RegisterVO saveNewParent(RegisterDTO registerDTO) throws UserNotCreatedException {
        if (authService.checkEmailExists(registerDTO.email())) {
            throw new EmailAlreadyExistedException("Email already exists");
        }
        try {
            String username = autoGeneratorHelper.generateUsername(registerDTO.fullname());
            User user = User.builder()
                    .email(registerDTO.email())
                    .username(username)
                    .password(passwordEncoder.encode(registerDTO.password()))
                    .role(ROLE_PARENT)
                    .status(true)
                    .fullname(registerDTO.fullname())
                    .phone(registerDTO.phone())
                    .build();
            Parent parent = Parent.builder()
                    .user(user)
                    .build();
//            user.setParent(parent);
            return parentMapper.toRegisterVO(parentRepository.save(parent));
        } catch (Exception e) {
            throw new UserNotCreatedException("Registration failed!" + e);
        }

    }

    @Transactional
    public ParentVO editParent(Integer parentId, ParentDTO parentDTO, MultipartFile image) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        log.info("parent0000: {}", parentMapper.toParentDTO(parent));

        User user = parent.getUser();

        String newEmail = parentDTO.email() != null ? parentDTO.email() : user.getEmail();
        if (!newEmail.equals(user.getEmail())) {
            Optional<User> existingUserEmail = userRepository.findByEmail(newEmail);
            if (existingUserEmail.isPresent() && !existingUserEmail.get().getId().equals(user.getId())) {
                throw new EmailAlreadyExistedException("Email already exists.");
            }
            log.info("email: {}", newEmail);
        }
        log.info("parent {}" ,parentDTO);

        // Check if the date of birth is in the past
        if (parentDTO.dob() == null || !parentDTO.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }

        // Update User
        user = User.builder()
                .id(user.getId())
                .username(parent.getUser().getUsername())
                .phone(parentDTO.phone())
                .fullname(parentDTO.fullname())
                .status(parentDTO.status())
                .dob(parentDTO.dob())
                .role(ROLE_PARENT)
                .password(user.getPassword())
                .email(newEmail)
                .phone(parentDTO.phone())
                .build();
        log.info("user: {}", user);

        // Handle image upload if provided
        Media media = parent.getMedia(); // Existing media, if any
        log.info("media: {}", media);
        if (image != null && !image.isEmpty()) {
            // Validate file size (e.g., max 5MB)
            long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
            log.info("size: {}", image.getSize());
            if (image.getSize() > MAX_FILE_SIZE) {
                throw new RuntimeException("Image file cannot exceed 5MB");
            }

            log.info("da check size: {}", image);

            // Validate file type (e.g., JPEG, PNG)
            try {
                String mimeType = image.getContentType();
                if (mimeType == null || !mimeType.startsWith("image/")) {
                    throw new RuntimeException("Invalid file type. Only images (JPEG, PNG) are allowed.");
                }
                log.info("da check type: {}", image);
            } catch (Exception e) {
                throw new RuntimeException("Error validating image file: " + e.getMessage());
            }



            // Convert MultipartFile to java.io.File
            java.io.File tempFile;
            try {
                tempFile = java.io.File.createTempFile("parent_image_", ".tmp");
                image.transferTo(tempFile);
                log.info("tempFile: {}", tempFile);
            } catch (IOException e) {
                throw new RuntimeException("Error converting image file: " + e.getMessage());

            }

            // Upload image using GGDriveImageService
            ImageVO imageVO = ggDriveImageService.uploadImage(
                    tempFile,
                    "Parent_" + parentId + "_Profile_",
                    FileFolderEnum.USER_IMAGES// Assuming this enum exists
            );
            log.info("imageVO: {}", imageVO);

            if (imageVO.status() == 200) {
                // Create or update Media entity
                if (media == null) {
                    media = new Media();
                   parent.setMedia(media); // Set the parent reference
                } else {
                    // Optionally delete the old image from Google Drive
                    if (media.getCloudId() != null) {
                        ggDriveImageService.deleteUploadedImage(media.getCloudId());
                    }
                }

                media.setUrl(imageVO.url());
                media.setSize(String.valueOf(imageVO.size()));
                media.setCloudId(imageVO.fileId());
                media.setFilename(imageVO.fileName());
                media.setType("image/png"); // Assuming PNG from uploadImage output
                media.setUploadTime(LocalDate.now());
                 media.setId(media.getId());

                log.info("Image uploaded successfully: {}", imageVO.url());
            } else {
                throw new RuntimeException("Failed to upload image: " + imageVO.message());
            }

            // Clean up temporary file
            if (!tempFile.delete()) {
                log.warn("Failed to delete temporary file: {}", tempFile.getName());
            }
        }

        // Update Parent
        parent = Parent.builder()
                .id(parentId)
                .district(parentDTO.district())

                .ward(parentDTO.ward())
                .province(parentDTO.province())
                .street(parentDTO.street())
                .user(user)
                .media(media) // Set the updated or new media
                .build();
        log.info("parent2: {}", parentMapper.toParentVO(parent));

        // Save changes
        userRepository.save(user);
        parentRepository.save(parent); // This will also save the associated Media due to cascade = CascadeType.ALL
        log.info("save parent success");

        // Return updated information
        return parentMapper.toParentVO(parent);
    }

    @Transactional
    public ParentVO getParentById(Integer userId) {
        Parent parent = parentRepository.findParentByUserId(userId);
        if (parent == null) {
            throw new UserNotFoundException();
        }

        return parentMapper.toParentVO(parent);
    }

    @Transactional
    public void changePassword(Integer parentId, String oldPassword, String newPassword) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(UserNotFoundException::new);

        User user = parent.getUser();

        // Check if the old password is correct
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IncorrectPasswordException();
        }

        // Update new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

}


