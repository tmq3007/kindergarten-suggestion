package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.InappropriateSchoolStatusException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._13xx_school.StatusNotExistException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.common.exception._14xx_data.UploadFileException;
import fa.pjb.back.event.model.SchoolApprovedEvent;
import fa.pjb.back.event.model.SchoolPublishedEvent;
import fa.pjb.back.event.model.SchoolRejectedEvent;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.mapper.SchoolOwnerProjection;
import fa.pjb.back.model.vo.*;
import fa.pjb.back.repository.*;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.SchoolService;
import io.micrometer.core.aop.CountedAspect;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static fa.pjb.back.model.enums.FileFolderEnum.SCHOOL_IMAGES;
import static fa.pjb.back.model.enums.SchoolStatusEnum.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class SchoolServiceImpl implements SchoolService {
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/jpg");

    private final SchoolRepository schoolRepository;
    private final FacilityRepository facilityRepository;
    private final UtilityRepository utilityRepository;
    private final MediaRepository mediaRepository;
    private final SchoolMapper schoolMapper;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final GGDriveImageService imageService;
    private final SchoolOwnerRepository schoolOwnerRepository;
    private final ApplicationEventPublisher eventPublisher;
    private static final Tika tika = new Tika();
//    private final CountedAspect countedAspect;
    @Value("${school-detailed-link}")
    private String schoolDetailedLink;
    @Value("${school-detail-link-admin}")
    private String schoolDetailedLinkAdmin;


    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    public SchoolDetailVO getSchoolInfo(Integer schoolId) {
        School school = schoolRepository.findById(schoolId).orElseThrow(SchoolNotFoundException::new);
        return schoolMapper.toSchoolDetailVO(school);
    }

    public void processAndSaveImages(List<MultipartFile> images, School school) {
        if (school == null) {
            throw new IllegalArgumentException("School cannot be null");
        }

        // Step 1: Filter valid images
        List<MultipartFile> validImages = filterValidImages(images);

        if (validImages.isEmpty()) {
            log.warn("No valid images to process for school ID: {}", school.getId());
            return;
        }

        // Upload images to cloud
        List<FileUploadVO> imageVOList = uploadImagesToCloud(validImages, school);

        // Prepare and save media entities
        saveMediaEntities(imageVOList, school);
    }

    private List<MultipartFile> filterValidImages(List<MultipartFile> images) {
        return images.stream()
                .filter(this::isValidImage)
                .collect(Collectors.toList());
    }

    private boolean isValidImage(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                log.warn("Skipping empty file: {}", file.getOriginalFilename());
                return false;
            }

            String mimeType = tika.detect(file.getBytes());
            boolean isValid = ALLOWED_MIME_TYPES.contains(mimeType) && file.getSize() <= MAX_FILE_SIZE;

            if (!isValid) {
                log.warn("Invalid file: {} (MIME: {}, Size: {})",
                        file.getOriginalFilename(), mimeType, file.getSize());
            }
            return isValid;
        } catch (IOException e) {
            log.error("Error validating file {}: {}", file.getOriginalFilename(), e.getMessage());
            return false;
        }
    }

    private List<FileUploadVO> uploadImagesToCloud(List<MultipartFile> images, School school) {
        try {
            List<File> convertedFiles = imageService.convertMultiPartFileToFile(images);
            List<FileUploadVO> imageVOList = imageService.uploadListFiles(
                    convertedFiles,
                    "School_" + school.getId() + "_Image_",
                    SCHOOL_IMAGES,
                    imageService::uploadImage
            );

            // Clean up temporary files
            convertedFiles.forEach(file -> {
                if (file.exists() && !file.delete()) {
                    log.warn("Failed to delete temporary file: {}", file.getAbsolutePath());
                }
            });

            return imageVOList;
        } catch (IOException e) {
            throw new UploadFileException("Failed to upload images for school ID " + school.getId() + ": " + e.getMessage());
        }
    }

    private void saveMediaEntities(List<FileUploadVO> imageVOList, School school) {
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
                        .school(school)
                        .build();
                mediaList.add(media);
            } else {
                log.error("Failed to upload image: {} (Status: {})", imageVO.fileName(), imageVO.status());
            }
        }

        if (!mediaList.isEmpty()) {
            mediaRepository.saveAll(mediaList);
            log.info("Saved {} media entities for school ID: {}", mediaList.size(), school.getId());
        }

        if (mediaList.size() < imageVOList.size()) {
            log.warn("Partial upload failure: {} out of {} images processed for school ID: {}",
                    mediaList.size(), imageVOList.size(), school.getId());
            //optional admin notification or retry attempt
        }
    }

    /**
     * Handles deletion of old images from cloud and database.
     */
    private void deleteOldImages(School school) {
        List<Media> oldMedias = mediaRepository.getAllBySchool(school);
        if (oldMedias.isEmpty()) {
            return;
        }

        List<Media> successfullyDeletedMedias = new ArrayList<>();
        List<String> failedDeletions = new ArrayList<>();

        // Attempt to delete from cloud
        for (Media media : oldMedias) {
            try {
                FileUploadVO deleteResponse = imageService.deleteUploadedImage(media.getCloudId());
                if (deleteResponse.status() == 200) {
                    successfullyDeletedMedias.add(media);
                    school.getImages().remove(media); // Update in-memory entity
                } else {
                    failedDeletions.add(media.getCloudId());
                    log.error("Failed to delete image with cloudId {}: Status {}", media.getCloudId(), deleteResponse.status());
                }
            } catch (Exception e) {
                failedDeletions.add(media.getCloudId());
                log.error("Exception while deleting image with cloudId {}: {}", media.getCloudId(), e.getMessage());
            }
        }

        // If all deletions failed, throw an exception or handle accordingly
        if (successfullyDeletedMedias.isEmpty() && !oldMedias.isEmpty()) {
            throw new UploadFileException("Failed to delete any images from cloud: " + failedDeletions);
        }

        // Delete from database only if cloud deletion succeeded
        if (!successfullyDeletedMedias.isEmpty()) {
            mediaRepository.deleteAll(successfullyDeletedMedias);
            log.info("Successfully deleted {} images from cloud and database", successfullyDeletedMedias.size());
        }

        // Handle partial failures
        if (!failedDeletions.isEmpty()) {
            log.warn("Partial failure: {} images could not be deleted from cloud", failedDeletions.size());
        }
    }

    @Transactional
    @Override
    public SchoolDetailVO addSchool(SchoolDTO schoolDTO, List<MultipartFile> image) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Check if principal is an instance of User entity
        if (!(principal instanceof User user)) {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        //  Map DTO to School entity
        School school = prepareSchoolData(schoolDTO, new School());

        // Check user role and adjust status
        if (user.getRole() == ERole.ROLE_ADMIN && schoolDTO.status() == SUBMITTED.getValue()) {
            school.setStatus(APPROVED.getValue());
        }
        // Save the School to generate its ID
        School newSchool = schoolRepository.save(school);

        // Validate and upload images (if provided)
        if (image != null && !image.isEmpty()) {
            processAndSaveImages(image, newSchool);
        }

        // Send submit emails to admins
        if (user.getRole() == ERole.ROLE_SCHOOL_OWNER && newSchool.getStatus() == SUBMITTED.getValue()) {
            emailService.sendSubmitEmailToAllAdmin(
                    newSchool.getName(),
                    user.getUsername(),
                    schoolDetailedLinkAdmin + newSchool.getId()
            );
        }

        return schoolMapper.toSchoolDetailVO(newSchool);
    }

    private void validateAndSetAssociations(SchoolDTO schoolDTO, School school) {
        // Validate facilities
        if (schoolDTO.facilities() != null) {
            int existingFacilitiesSize = facilityRepository.findAllByFidIn(schoolDTO.facilities()).size();
            if (existingFacilitiesSize != schoolDTO.facilities().size()) {
                throw new InvalidDataException("Some facilities do not exist in the database");
            }
        }

        // Validate utilities
        if (schoolDTO.utilities() != null) {
            int existingUtilitiesSize = utilityRepository.findAllByUidIn(schoolDTO.utilities()).size();
            if (existingUtilitiesSize != schoolDTO.utilities().size()) {
                throw new InvalidDataException("Some utilities do not exist in the database");
            }
        }

        // Update all SchoolOwners with the saved School and batch-save them
        if (schoolDTO.schoolOwners() != null && !schoolDTO.schoolOwners().isEmpty()) {
            Set<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllByIdIn(schoolDTO.schoolOwners());
            if (schoolOwners.size() != schoolDTO.schoolOwners().size()) {
                throw new InvalidDataException("One or more SchoolOwner IDs not found");
            }
            for (SchoolOwner owner : schoolOwners) {
                owner.setSchool(school);
            }
            school.setSchoolOwners(schoolOwners);
        } else {
            school.setSchoolOwners(new HashSet<>());
        }
    }

    private SchoolDetailVO processSchoolUpdate(SchoolDTO schoolDTO, List<MultipartFile> images, Byte status) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        // Find School Owner from UserID
        SchoolOwner schoolOwner = schoolOwnerRepository
                .findWithSchoolAndDraftByUserId(user.getId())
                .orElseThrow(UserNotFoundException::new);

        // Check if school exists or not
        School originSchool = schoolOwner.getSchool();
        if (originSchool == null) {
            throw new SchoolNotFoundException();
        }
        Integer originSchoolId = originSchool.getId();

        // Check if draft exists or not
        School draft = originSchool.getDraft();

        // If status of school or draft is submitted thus can not update
        if (originSchool.getStatus().equals(SUBMITTED.getValue()) || (draft != null && draft.getStatus().equals(SUBMITTED.getValue()))) {
            throw new IllegalStateException("Cannot update a submitted school or draft");
        }

        if (draft == null) {
            draft = new School();
            draft.setOriginalSchool(originSchool);
        }

        // Update data from DTO into draft
        schoolMapper.toDraft(schoolDTO, draft);
        draft.setStatus(status);
        validateAndSetAssociations(schoolDTO, draft);
        // Delete old images
        if (draft.getImages() != null && !draft.getImages().isEmpty()) {
            draft.getImages().clear();
        }
        // Save new images
        if (images != null && !images.isEmpty()) {
            processAndSaveImages(images, draft);
        }
        draft.setPostedDate(LocalDate.now());
        draft = schoolRepository.save(draft);

        return schoolMapper.toSchoolDetailVO(draft);
    }

    private School prepareSchoolData(SchoolDTO schoolDTO, School oldSchool) {
        boolean isUpdate = schoolDTO.id() != null;

        // Check if email already exists
        if (isUpdate) {
            if (checkEditingEmailExists(schoolDTO.email(), schoolDTO.id())) {
                throw new EmailAlreadyExistedException("This email is already in use");
            }
        } else {
            if (checkEmailExists(schoolDTO.email())) {
                throw new EmailAlreadyExistedException("This email is already in use");
            }
        }

        School school = schoolMapper.toSchool(schoolDTO, oldSchool);
        school.setPostedDate(LocalDate.now());

        // Delete old images (only for updates)
        if (isUpdate) {
            deleteOldImages(school);
        }

        validateAndSetAssociations(schoolDTO, school);

        return school;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    @Override
    public SchoolDetailVO updateSchoolByAdmin(SchoolDTO schoolDTO, List<MultipartFile> images) {
        // Check if the school exists
        School oldSchool = schoolRepository.findById(schoolDTO.id()).orElseThrow(SchoolNotFoundException::new);
        Byte curStatus = oldSchool.getStatus();
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Check if principal is an instance of User entity
        if (!(principal instanceof User)) {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        // Update entity fields from DTO
        School school = prepareSchoolData(schoolDTO, oldSchool);
        school.setStatus(curStatus);

        schoolRepository.save(school);

        // Handle new uploaded images
        if (images != null && !images.isEmpty()) {
            processAndSaveImages(images, school);
        }
        // Save the updated school data

        return schoolMapper.toSchoolDetailVO(school);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Transactional
    @Override
    public SchoolDetailVO updateSchoolBySchoolOwner(SchoolDTO schoolDTO, List<MultipartFile> images) {
        return processSchoolUpdate(schoolDTO, images, SUBMITTED.getValue());
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Transactional
    @Override
    public SchoolDetailVO saveSchoolBySchoolOwner(SchoolDTO schoolDTO, List<MultipartFile> images) {
        return processSchoolUpdate(schoolDTO, images, SAVED.getValue());
    }

    @Override
    public List<SchoolOwnerVO> findSchoolOwnerForAddSchool(String expectedSchool) {
        List<SchoolOwnerProjection> projections = schoolOwnerRepository.searchSchoolOwnersByExpectedSchool(expectedSchool);
        // Convert projection to VO
        return projections.stream()
                .map(projection -> new SchoolOwnerVO(
                        projection.getId(),
                        projection.getUserId(),
                        projection.getFullname(),
                        projection.getUsername(),
                        projection.getEmail(),
                        projection.getPhone(),
                        projection.getExpectedSchool(),
                        projection.getImageList(),
                        projection.getDob()
                ))
                .toList();
    }

    @Override
    public List<ExpectedSchoolVO> findAllDistinctExpectedSchoolsByRole(Integer id) {
        User user = userRepository.findById(id).get();
        if (user.getRole() == ERole.ROLE_ADMIN) {
            return schoolOwnerRepository.findDistinctByExpectedSchoolIsNotNull();
        } else if (user.getRole() == ERole.ROLE_SCHOOL_OWNER) {
            return schoolOwnerRepository.getExpectedSchoolByUserId(id);
        } else {
            throw new AuthenticationFailedException("Something went wrong! Cannot find role");
        }
    }


    @Override
    public Page<SchoolListVO> getAllSchools(String name, String province, String district,
                                            String street, String email, String phone, Pageable pageable) {
        Page<School> schoolPage = schoolRepository.findSchools(name, province, district, street, email, phone, pageable);
        return schoolPage.map(schoolMapper::toSchoolListVO);
    }

    @Override
    public SchoolDetailVO getSchoolByUserId(Integer userId) {
        School school = schoolRepository.findSchoolByUserId(userId)
                .orElseThrow(() -> new RuntimeException("School not found for user ID: " + userId));
        return schoolMapper.toSchoolDetailVO(school);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    public SchoolDetailVO getDraft(User user) {
        Integer userId = user.getId();
        SchoolOwner so = schoolOwnerRepository.findWithSchoolAndDraftByUserId(userId).orElseThrow(UserNotFoundException::new);
        School school = so.getSchool();
        if (school == null) throw new SchoolNotFoundException();
        School draft = school.getDraft();
        return schoolMapper.toSchoolDetailVO(draft);
    }

    /**
     * Updates the status of a school based on the provided status code.
     **/

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    @Transactional
    public void updateSchoolStatusByAdmin(ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        int schoolID = changeSchoolStatusDTO.schoolId();

        Byte preparedStatus = changeSchoolStatusDTO.status();

        // Retrieve the school entity by ID, or throw an exception if not found
        School school = schoolRepository.findById(schoolID)
                .orElseThrow(SchoolNotFoundException::new);

        Byte currentSchoolStatus = school.getStatus();
        String currentSchoolEmail = school.getEmail();
        String currentSchoolName = school.getName();


        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String username;

        // Check if principal is an instance of User entity
        if (principal instanceof User user) {

            username = user.getUsername();

        } else {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        switch (preparedStatus) {

            case 2 -> {
                // Change to "Approved" status if current status is "Submitted"
                if (currentSchoolStatus == 1) {
                    school.setStatus(preparedStatus);
                    eventPublisher.publishEvent(new SchoolApprovedEvent(currentSchoolEmail, currentSchoolName, schoolDetailedLink));
                } else {
                    throw new InappropriateSchoolStatusException();
                }
            }

            case 3 -> {
                // Change to "Rejected" status if current status is "Submitted"
                if (currentSchoolStatus == 1) {
                    school.setStatus(preparedStatus);
                    eventPublisher.publishEvent(new SchoolRejectedEvent(currentSchoolEmail, school.getName()));
                } else {
                    throw new InappropriateSchoolStatusException();
                }
            }

            case 4 -> {
                // Change to "Published" status if current status is "Approved"
                if (currentSchoolStatus == 2 || currentSchoolStatus == 5) {

                    school.setStatus(preparedStatus);

                    // Set public permission to true for all school owners relate to current school
                    List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolID);

                    for (SchoolOwner so : schoolOwners) {
                        so.setPublicPermission(true);
                        schoolOwnerRepository.saveAndFlush(so);
                    }
                    eventPublisher.publishEvent(new SchoolPublishedEvent(currentSchoolEmail, currentSchoolName, username, schoolDetailedLink));
                } else {
                    throw new InappropriateSchoolStatusException();
                }

            }

            case 5 -> {
                //Change to "Unpublished" status if current status is "Published"
                if (currentSchoolStatus == 4) {

                    school.setStatus(preparedStatus);

                    // Set public permission to false for all school owners relate to current school
                    List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolID);

                    for (SchoolOwner so : schoolOwners) {
                        so.setPublicPermission(false);
                        schoolOwnerRepository.saveAndFlush(so);
                    }

                } else {
                    throw new InappropriateSchoolStatusException();
                }
            }

            case 6 ->
                // Change to "Deleted" status
                    school.setStatus(preparedStatus);


            default -> throw new StatusNotExistException("Status does not exist");

        }
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    @Transactional
    public void updateSchoolStatusBySchoolOwner(ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String username;

        Boolean publicPermission;

        int ownedSchoolID;

        // Check if principal is an instance of User entity
        if (principal instanceof User user) {

            username = user.getUsername();

            publicPermission = schoolOwnerRepository.findByUserId(user.getId()).orElseThrow().getPublicPermission();

            ownedSchoolID = schoolOwnerRepository.findByUserId(user.getId()).orElseThrow().getSchool().getId();

        } else {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        School school = schoolRepository.findById(ownedSchoolID)
                .orElseThrow(SchoolNotFoundException::new);

        switch (changeSchoolStatusDTO.status()) {

            case 4 -> {

                // Check if public permission is true
                if (publicPermission) {
                    // Change to "Published" status if current status is "Approved" or "Unpublished"
                    if (school.getStatus() == 2 || school.getStatus() == 5) {
                        school.setStatus(changeSchoolStatusDTO.status());
                        eventPublisher.publishEvent(new SchoolPublishedEvent(school.getEmail(), school.getName(), username, schoolDetailedLink));
                    } else {
                        throw new InappropriateSchoolStatusException();
                    }
                } else {
                    throw new AuthenticationFailedException("You do not have permission to publish the school");
                }
            }

            case 5 -> {
                // Change to "Unpublished" status if current status is "Published"
                if (school.getStatus() == 4) {
                    school.setStatus(changeSchoolStatusDTO.status());
                } else {
                    throw new InappropriateSchoolStatusException();
                }

            }

            case 6 -> {
                if (school.getStatus() != 2) {

                    school.setStatus(changeSchoolStatusDTO.status());

                } else {
                    throw new InappropriateSchoolStatusException();
                }
            }

            default -> throw new StatusNotExistException("Status does not exist");

        }
    }

    @Override
    public boolean checkEmailExists(String email) {
        return schoolRepository.existsByEmail(email);
    }

    @Override
    public boolean checkEditingEmailExists(String email, Integer schoolId) {
        log.info("email: {}", email);
        log.info("schoolId: {}", schoolId);
        return schoolRepository.existsByEmailExcept(email, schoolId);
    }

    @Override
    public boolean checkPhoneExists(String phone) {
        return schoolRepository.existsByPhone(phone);
    }


}
