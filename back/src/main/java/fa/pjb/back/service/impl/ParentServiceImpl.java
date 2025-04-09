package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotCreatedException;
import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._14xx_data.IncorrectPasswordException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.common.exception._14xx_data.InvalidDateException;
import fa.pjb.back.common.exception._14xx_data.RecordNotFoundException;
import fa.pjb.back.common.util.AutoGeneratorHelper;
import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.enums.EFileFolder;
import fa.pjb.back.model.enums.EParentInSchool;
import fa.pjb.back.model.mapper.*;
import fa.pjb.back.model.vo.*;
import fa.pjb.back.repository.ParentInSchoolRepository;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.GCPFileStorageService;
import fa.pjb.back.service.ParentService;
import fa.pjb.back.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static fa.pjb.back.model.enums.ERole.ROLE_PARENT;

@RequiredArgsConstructor
@Slf4j
@Service
public class ParentServiceImpl implements ParentService {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final ParentInSchoolRepository parentInSchoolRepository;
    private final ReviewRepository reviewRepository;
    private final ParentMapper parentMapper;
    private final ParentInSchoolMapper pisMapper;
    private final AutoGeneratorHelper autoGeneratorHelper;
    private final GCPFileStorageService ggDriveImageService;
    private final UserService userService;
    private final MediaMapper mediaMapper;
    private final SchoolMapper schoolMapper;
    private final ReviewMapper reviewMapper;

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

        String newPhone = parentUpdateDTO.phone() != null ? parentUpdateDTO.phone() : user.getPhone();
        if (!newPhone.equals(user.getPhone())) {
            Optional<User> existingUserPhone = userRepository.findByPhone(newPhone);
            if (existingUserPhone.isPresent() && !existingUserPhone.get().getId().equals(user.getId())) {
                throw new EmailAlreadyExistedException("Phone already exists.");
            }
            log.info("phone: {}", newPhone);
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
            File tempFile;
            try {
                tempFile = File.createTempFile("parent_image_", ".tmp");
                image.transferTo(tempFile);
                log.info("tempFile: {}", tempFile);
            } catch (IOException e) {
                throw new RuntimeException("Error converting image file: " + e.getMessage());
            }

            // Upload the image to Google Drive using GGDriveImageService
            FileUploadVO imageVO = ggDriveImageService.uploadImage(
                    tempFile,
                    "Parent_" + userId + "_Profile_",
                    EFileFolder.USER_IMAGES
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
    public MediaVO changeAvatar(Integer parentId, MultipartFile image) {
        Parent parent = parentRepository.findParentByUserId(parentId);
        if (parent == null) {
            throw new UserNotFoundException();
        }
        log.info("parent: {}", parent);

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
            File tempFile;
            try {
                tempFile = File.createTempFile("parent_image_", ".tmp");
                image.transferTo(tempFile);
                log.info("tempFile: {}", tempFile);
            } catch (IOException e) {
                throw new RuntimeException("Error converting image file: " + e.getMessage());
            }

            // Upload the image to Google Drive using GGDriveImageService
            FileUploadVO imageVO = ggDriveImageService.uploadImage(
                    tempFile,
                    "Parent_" + parentId + "_Profile_",
                    EFileFolder.USER_IMAGES
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

        log.info("parentVO: {}", parentMapper.toParentVO(parent));
        return mediaMapper.toMediaVO(media);
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

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public Page<ParentVO> getAllParent(int page, int size, String searchBy, String keyword, Boolean status) {
        if (!Arrays.asList("username", "fullname", "email", "phone").contains(searchBy)) {
            throw new InvalidDataException("Invalid searchBy value: " + searchBy);
        }
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<ParentProjection> parentProjections = parentRepository.findAllParentsWithFilters(status, searchBy, keyword, pageable);

        return parentProjections.map(parentMapper::toParentVOFromProjection);
    }

    @Override
    public Page<ParentVO> getParentBySchool(int page, int size, String searchBy, String keyword) {
        //Check if valid searchBy value
        if (!Arrays.asList("username", "fullname", "email", "phone").contains(searchBy)) {
            throw new InvalidDataException("Invalid searchBy value: " + searchBy);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        User user = userService.getCurrentUser();

        Page<ParentProjection> parentProjections = parentRepository.findActiveParentsInSchoolWithFilters(user.getSchoolOwner().getSchool().getId(), searchBy, keyword, pageable);

        return parentProjections.map(parentMapper::toParentVOFromProjection);
    }

    @Override
    public Page<ParentVO> getEnrollRequestBySchool(int page, int size, String searchBy, String keyword) {
        //Check if valid searchBy value
        if (!Arrays.asList("username", "fullname", "email", "phone").contains(searchBy)) {
            throw new InvalidDataException("Invalid searchBy value: " + searchBy);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        User user = userService.getCurrentUser();

        Page<ParentProjection> parentProjections = parentRepository.findEnrollRequestBySchool(user.getSchoolOwner().getSchool().getId(), searchBy, keyword, pageable);

        return parentProjections.map(parentMapper::toParentVOFromProjection);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    @Transactional
    public Boolean enrollParent(Integer parentInSchoolId) {
        // Get ParentInSchool by ID
        ParentInSchool parentInSchool = parentInSchoolRepository
                .findOneById(parentInSchoolId)
                .orElseThrow(RecordNotFoundException::new);

        // Change status from PENDING to ACTIVE
        parentInSchool.setStatus(EParentInSchool.ACTIVE.getValue());

        // Save enroll date
        parentInSchool.setFrom(LocalDate.now());

        // Save the change
        parentInSchoolRepository.save(parentInSchool);

        return true;
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    @Transactional
    public Boolean unEnrollParent(Integer parentInSchoolId) {
        // Get ParentInSchool by ID
        ParentInSchool parentInSchool = parentInSchoolRepository
                .findOneById(parentInSchoolId)
                .orElseThrow(RecordNotFoundException::new);

        // Change status from ACTIVE to INACTIVE
        parentInSchool.setStatus(EParentInSchool.INACTIVE.getValue());

        // Save un-enroll date
        parentInSchool.setTo(LocalDate.now());

        // Save the change
        parentInSchoolRepository.save(parentInSchool);

        return true;
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    @Transactional
    public Boolean rejectParent(Integer parentInSchoolId) {
        // Get ParentInSchool by ID
        ParentInSchool parentInSchool = parentInSchoolRepository
                .findOneById(parentInSchoolId)
                .orElseThrow(RecordNotFoundException::new);

        // Delete this record from database
        parentInSchoolRepository.delete(parentInSchool);

        return true;
    }

    @Override
    public Integer getSchoolRequestCount() {
        User user = userService.getCurrentUser();
        return parentInSchoolRepository.countParentInSchoolBySchoolIdAndStatus(user.getSchoolOwner().getSchool().getId(), (byte) 0);
    }

    @Override
    public List<ParentInSchoolVO> getAcademicHistory(Integer parentId) {
        List<Object[]> results = parentInSchoolRepository.findAcademicHistoryWithReviews(parentId);

        return results.stream()
                .map(result -> pisMapper.toParentInSchoolVOAcademicHistory(
                        (ParentInSchool) result[0], // pis
                        (School) result[1],         // school
                        (Review) result[2]          // review
                ))
                .collect(Collectors.toList());
    }

    @Override
    public Page<ParentInSchoolDetailVO> getPresentAcademicHistory(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        User user = userService.getCurrentUser();

        Page<Object[]> results = parentInSchoolRepository.findPresentAcademicHistoryWithReviews(user.getParent().getId(), pageable);

        return results.map(result -> {

            SchoolSearchVO schoolSearchVO = schoolMapper.toSchoolSearchVO((School) result[1], reviewMapper);

            List<Object[]> statistics = reviewRepository.getReviewStatisticsBySchoolId(schoolSearchVO.id());

            Object[] statisticsObject = statistics.get(0);

            ParentInSchool parentInSchool = (ParentInSchool) result[0];

            Review review = (Review) result[2];

            log.info("Review: {}", review);

            return ParentInSchoolDetailVO.builder()
                    .id(parentInSchool.getId())
                    .school(schoolSearchVO)
                    .fromDate(parentInSchool.getFrom())
                    .toDate(parentInSchool.getTo())
                    .status(parentInSchool.getStatus())
                    .providedRating(review == null ? null : (review.getLearningProgram() +
                            review.getFacilitiesAndUtilities() +
                            review.getExtracurricularActivities() +
                            review.getTeacherAndStaff() +
                            review.getHygieneAndNutrition()) / 5.0)
                    .comment(review == null ? null : review.getFeedback())
                    .hasEditCommentPermission(true)
                    .totalSchoolReview(Integer.parseInt(String.valueOf(statisticsObject[0])))
                    .averageSchoolRating(Math.floor(((Double) statisticsObject[1]) * 10) / 10)
                    .build();
        });
    }

    @Override
    public Page<ParentInSchoolDetailVO> getPreviousAcademicHistory(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        User user = userService.getCurrentUser();

        Page<Object[]> results = parentInSchoolRepository.findPreviousAcademicHistoryWithReviews(user.getParent().getId(), pageable);

        return results.map(result -> {
            SchoolSearchVO schoolSearchVO = schoolMapper.toSchoolSearchVO((School) result[1], reviewMapper);

            List<Object[]> statistics = reviewRepository.getReviewStatisticsBySchoolId(schoolSearchVO.id());

            Object[] statisticsObject = statistics.get(0);

            ParentInSchool parentInSchool = (ParentInSchool) result[0];

            Review review = (Review) result[2];

            boolean hasPermission = Math.abs(ChronoUnit.DAYS.between(LocalDate.now(), parentInSchool.getTo())) >= 30;

            return ParentInSchoolDetailVO.builder()
                    .id(parentInSchool.getId())
                    .school(schoolSearchVO)
                    .fromDate(parentInSchool.getFrom())
                    .toDate(parentInSchool.getTo())
                    .status(parentInSchool.getStatus())
                    .providedRating(review == null ? null : (review.getLearningProgram() +
                            review.getFacilitiesAndUtilities() +
                            review.getExtracurricularActivities() +
                            review.getTeacherAndStaff() +
                            review.getHygieneAndNutrition()) / 5.0)
                    .comment(review == null ? null : review.getFeedback())
                    .hasEditCommentPermission(hasPermission)
                    .totalSchoolReview(Integer.parseInt(String.valueOf(statisticsObject[0])))
                    .averageSchoolRating(Math.floor(((Double) statisticsObject[1]) * 10) / 10)
                    .build();
        });
    }


}


