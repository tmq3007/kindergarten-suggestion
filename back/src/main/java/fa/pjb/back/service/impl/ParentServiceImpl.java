package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._14xx_data.IncorrectPasswordException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.common.exception._10xx_user.UserNotCreatedException;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.FileFolderEnum;
import fa.pjb.back.model.mapper.MediaMapper;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.ImageVO;
import fa.pjb.back.model.vo.MediaVO;
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
    private final MediaMapper mediaMapper;
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
    public ParentVO editParent(Integer userId, ParentUpdateDTO parentUpdateDTO, MultipartFile image) {
        // Fetch the existing Parent entity from the repository
        Parent parent = parentRepository.findParentByUserId(userId);
        if (parent == null) {
            throw new UserNotFoundException();
        }
        log.info("parentCheck: {}", parent);
        log.info("parentUpdateDTO: {}", parentMapper.toParentDTO(parent));

        // Get the existing User entity associated with the Parent
        User user = parent.getUser();

        // Check and update email if provided, otherwise keep the current one
        String newEmail = parentUpdateDTO.email() != null ? parentUpdateDTO.email() : user.getEmail();
        if (!newEmail.equals(user.getEmail())) {
            Optional<User> existingUserEmail = userRepository.findByEmail(newEmail);
            if (existingUserEmail.isPresent() && !existingUserEmail.get().getId().equals(user.getId())) {
                throw new EmailAlreadyExistedException("Email already exists.");
            }
            log.info("email: {}", newEmail);
        }
        log.info("parentUpdateDTO: {}", parentUpdateDTO);

        // Validate that the date of birth is in the past
        if (parentUpdateDTO.dob() == null || !parentUpdateDTO.dob().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Dob must be in the past");
        }

        // Update User fields directly on the existing entity
        user.setFullname(parentUpdateDTO.fullname());
        user.setEmail(newEmail);
        user.setPhone(parentUpdateDTO.phone());
        user.setStatus(parentUpdateDTO.status());
        user.setDob(parentUpdateDTO.dob());
        user.setRole(ROLE_PARENT);

        // Handle image upload if provided
        Media media = parent.getMedia(); // Get existing Media, if any
        log.info("media: {}", media);
        if (image != null && !image.isEmpty()) {
            // Validate file size (max 5MB)
            long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
            log.info("size: {}", image.getSize());
            if (image.getSize() > MAX_FILE_SIZE) {
                throw new RuntimeException("Image file cannot exceed 5MB");
            }

            // Validate file type (JPEG or PNG)
            String mimeType = image.getContentType();
            if (mimeType == null || !mimeType.startsWith("image/")) {
                throw new RuntimeException("Invalid file type. Only JPEG or PNG images are allowed.");
            }
            log.info("File type validated: {}", mimeType);

            // Convert MultipartFile to a temporary java.io.File
            java.io.File tempFile;
            try {
                tempFile = java.io.File.createTempFile("parent_image_", ".tmp");
                image.transferTo(tempFile);
                log.info("tempFile: {}", tempFile);
            } catch (IOException e) {
                throw new RuntimeException("Error converting image file: " + e.getMessage());
            }

            // Upload the image to Google Drive using GGDriveImageService
            ImageVO imageVO = ggDriveImageService.uploadImage(
                    tempFile,
                    "Parent_" + userId + "_Profile_",
                    FileFolderEnum.USER_IMAGES
            );
            log.info("imageVO: {}", imageVO);

            if (imageVO.status() == 200) {
                // Create a new Media entity or update the existing one
                if (media == null) {
                    media = new Media();
                    media.setParent(parent); // Link the Media to the Parent
                } else if (media.getCloudId() != null) {
                    // Delete the old image from Google Drive if it exists
                    ggDriveImageService.deleteUploadedImage(media.getCloudId());
                }

                // Update Media fields with the new image details
                media.setUrl(imageVO.url());
                media.setSize(String.valueOf(imageVO.size()));
                media.setCloudId(imageVO.fileId());
                media.setFilename(imageVO.fileName());
                media.setType("image/png"); // Assuming PNG format
                media.setUploadTime(LocalDate.now());

                parent.setMedia(media); // Assign the updated Media to Parent
                log.info("Image uploaded successfully: {}", imageVO.url());
            } else {
                throw new RuntimeException("Failed to upload image: " + imageVO.message());
            }

            // Clean up the temporary file
            if (!tempFile.delete()) {
                log.warn("Failed to delete temporary file: {}", tempFile.getName());
                tempFile.deleteOnExit(); // Fallback to delete when JVM exits
            }
        }

        // Update Parent fields directly on the existing entity
        parent.setDistrict(parentUpdateDTO.district());
        parent.setWard(parentUpdateDTO.ward());
        parent.setProvince(parentUpdateDTO.province());
        parent.setStreet(parentUpdateDTO.street());
        parent.setUser(user); // Ensure User is linked (though not necessary due to existing relationship)

        log.info("parent2: {}", parentMapper.toParentVO(parent));

        // Save the Parent entity (this will cascade to User and Media due to CascadeType.ALL)
        parentRepository.save(parent);
        log.info("Parent saved successfully");

        // Return the updated ParentVO
        return parentMapper.toParentVO(parent);
    }

    @Transactional
    public ParentVO getParentById(Integer userId) {
        Parent parent = parentRepository.findParentByUserId(userId);
        if (parent == null) {
            throw new UserNotFoundException();
        }
        log.info("parentVO: {}", parent);

        return parentMapper.toParentVO(parent);
    }

    @Transactional
    public void changePassword(Integer userId, String oldPassword, String newPassword) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new UserNotFoundException();
        }
        log.info("user: {}", user.getPassword());

        if (oldPassword == null || oldPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Old password cannot be null or empty");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IncorrectPasswordException();
        }

        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("New password cannot be null or empty");
        }

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

}


