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
import fa.pjb.back.event.model.SchoolDeletedEvent;
import fa.pjb.back.event.model.SchoolPublishedEvent;
import fa.pjb.back.event.model.SchoolRejectedEvent;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.dto.SchoolSearchDTO;
import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.ReviewMapper;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.mapper.SchoolOwnerProjection;
import fa.pjb.back.model.vo.*;
import fa.pjb.back.repository.*;
import fa.pjb.back.repository.specification.SchoolSpecification;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.GCPFileStorageService;
import fa.pjb.back.service.SchoolService;
import fa.pjb.back.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final ReviewMapper reviewMapper;
    private final SchoolOwnerRepository schoolOwnerRepository;
    private final EmailService emailService;
    private final GCPFileStorageService imageService;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;
    private static final Tika tika = new Tika();
    @Value("${school-detailed-link}")
    private String schoolDetailedLink;
    @Value("${school-detail-link-admin}")
    private String schoolDetailedLinkAdmin;


    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    public SchoolDetailVO getSchoolInfo(Integer schoolId) {
        School school = schoolRepository.findByIdWithOriginalSchool(schoolId).orElseThrow(SchoolNotFoundException::new);
        List<SchoolOwnerVO> schoolOwnerVOList = findSchoolOwnerBySchool(school.getId());
        return schoolMapper.toSchoolDetailVOWithSchoolOwners(school, schoolOwnerVOList);
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

    private void updateSchoolOwnerForMergingDraft(Integer schoolId, Integer draftId, School originSchool) {
        // Get all school owners with schoolId and draftId
        Set<SchoolOwner> schoolOwners = schoolOwnerRepository.findBySchoolIdAndDraftId(schoolId, draftId);
        for (SchoolOwner schoolOwner : schoolOwners) {
            if (schoolOwner.getDraft() == null) {
                schoolOwner.setSchool(null);
            } else {
                schoolOwner.setSchool(schoolRepository.findById(schoolId).orElse(null));
            }
            schoolOwnerRepository.save(schoolOwner);
        }
        originSchool.setSchoolOwners(schoolOwners);
    }

    @Transactional
    @Override
    public SchoolDetailVO addSchool(SchoolDTO schoolDTO, List<MultipartFile> image) {
        User user = userService.getCurrentUser();

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

    private void validateFacilitiesAndUtilities(SchoolDTO schoolDTO) {
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
    }

    private void validateAndSetAssociations(SchoolDTO schoolDTO, School school, boolean isDraft) {
        validateFacilitiesAndUtilities(schoolDTO);

        if (isDraft) {
            if (schoolDTO.schoolOwners() != null && !schoolDTO.schoolOwners().isEmpty()) {
                Set<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllByIdIn(schoolDTO.schoolOwners());
                if (schoolOwners.size() != schoolDTO.schoolOwners().size()) {
                    throw new InvalidDataException("One or more SchoolOwner IDs not found");
                }
                for (SchoolOwner owner : schoolOwners) {
                    owner.setDraft(school);
                }
                school.setSchoolOwners(schoolOwners);
            } else {
                school.setSchoolOwners(new HashSet<>());
            }
            return;
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

    @Transactional
    protected SchoolDetailVO processSchoolUpdate(SchoolDTO schoolDTO, List<MultipartFile> images, Byte status) {
        User user = userService.getCurrentUser();

        // Find School Owner from UserID
        SchoolOwner schoolOwner = schoolOwnerRepository
                .findWithSchoolAndDraftByUserId(user.getId())
                .orElseThrow(UserNotFoundException::new);

        // Check if school exists or not
        School originSchool = schoolOwner.getSchool();
        if (originSchool == null) {
            throw new SchoolNotFoundException();
        }

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
        validateAndSetAssociations(schoolDTO, draft, true);

        // Delete old images in database
        if (draft.getImages() != null && !draft.getImages().isEmpty()) {
            // Delete old images in cloud
            deleteOldImages(draft);
            draft.getImages().clear();
        }

        // Save new images
        if (images != null && !images.isEmpty()) {
            processAndSaveImages(images, draft);
        }
        draft.setPostedDate(LocalDateTime.now());
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
        school.setPostedDate(LocalDateTime.now());

        // Delete old images (only for updates)
        if (isUpdate) {
            deleteOldImages(school);
        }
        validateAndSetAssociations(schoolDTO, school, false);
        return school;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    @Override
    public SchoolDetailVO updateSchoolByAdmin(SchoolDTO schoolDTO, List<MultipartFile> images) {
        User user = userService.getCurrentUser();
        if (user == null) return null;
        // Check if the school exists
        School oldSchool = schoolRepository.findById(schoolDTO.id()).orElseThrow(SchoolNotFoundException::new);
        Byte curStatus = oldSchool.getStatus();

        // Update entity fields from DTO
        School school = prepareSchoolData(schoolDTO, oldSchool);
        school.setStatus(curStatus);

        // Save the updated school data
        schoolRepository.save(school);

        // Handle new uploaded images
        if (images != null && !images.isEmpty()) {
            processAndSaveImages(images, school);
        }

        return schoolMapper.toSchoolDetailVO(school);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Transactional
    @Override
    public SchoolDetailVO updateSchoolBySchoolOwner(SchoolDTO schoolDTO, List<MultipartFile> images) {
        // Check status of saving school
        // 1. If status is SAVED >> update directly on origin school
        SchoolOwner schoolOwner = userService.getCurrentSchoolOwner();
        School oldSchool = schoolOwner.getSchool();
        Byte status = oldSchool.getStatus();
        if (status.equals(SAVED.getValue())) {
            // Change status from SAVED to SUBMITTED
            oldSchool.setStatus(SUBMITTED.getValue());
            // Save the change into the database
            schoolRepository.save(oldSchool);
            return schoolMapper.toSchoolDetailVO(oldSchool);
        }
        return processSchoolUpdate(schoolDTO, images, SUBMITTED.getValue());
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Transactional
    @Override
    public SchoolDetailVO saveSchoolBySchoolOwner(SchoolDTO schoolDTO, List<MultipartFile> images) {
        // Check status of saving school
        // 1. If status is SAVED >> update directly on origin school
        SchoolOwner schoolOwner = userService.getCurrentSchoolOwner();
        School oldSchool = schoolOwner.getSchool();
        log.info("school owners before change: {}", oldSchool.getSchoolOwners().size());
        for (SchoolOwner so : oldSchool.getSchoolOwners()) {
            log.info("school owners before change: {}", so);
        }

        Byte status = oldSchool.getStatus();
        if (status.equals(SAVED.getValue())) {
            School school = schoolMapper.toDraft(schoolDTO, oldSchool);
            school.setPostedDate(LocalDateTime.now());
            school.setStatus(status);

            // Check email
            if (checkEditingEmailExists(schoolDTO.email(), oldSchool.getId())) {
                throw new EmailAlreadyExistedException("This email is already in use");
            }

            // Validate facilities & utilities
            validateFacilitiesAndUtilities(schoolDTO);

            // Persist school
            school = schoolRepository.save(school);

            // Update school owner
            if (schoolDTO.schoolOwners() != null && !schoolDTO.schoolOwners().isEmpty()) {
                Set<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllByIdIn(schoolDTO.schoolOwners());
                if (schoolOwners.size() != schoolDTO.schoolOwners().size()) {
                    throw new InvalidDataException("One or more SchoolOwner IDs not found");
                }

                // Remove the relationship between School and old School Owners
                for (SchoolOwner oldOwner : oldSchool.getSchoolOwners()) {
                    oldOwner.setSchool(null);
                }

                // Crete the relationship between School and new School Owners
                for (SchoolOwner owner : schoolOwners) {
                    owner.setSchool(school);
                }
                school.setSchoolOwners(schoolOwners);
            } else {
                school.setSchoolOwners(new HashSet<>());
            }

            // Delete old images
            deleteOldImages(school);

            // Save new images
            if (images != null && !images.isEmpty()) {
                processAndSaveImages(images, school);
            }
            return schoolMapper.toSchoolDetailVO(school);
        }

        // 2. If status is not SAVED >> update data on draft and save it
        return processSchoolUpdate(schoolDTO, images, SAVED.getValue());
    }

    @Override
    public List<SchoolOwnerVO> findSchoolOwnerForAddSchool(String expectedSchool, String BRN) {
        List<SchoolOwnerProjection> projections = schoolOwnerRepository.searchSchoolOwnersByExpectedSchool(expectedSchool, BRN);
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

    private List<SchoolOwnerVO> findSchoolOwnerBySchool(Integer schoolId) {
        List<SchoolOwnerProjection> projections = schoolOwnerRepository.searchSchoolOwnersBySchoolId(schoolId);
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
        User user = userService.getCurrentUser();
        List<Object[]> so;
        if (user.getRole() == ERole.ROLE_ADMIN) {
            so = schoolOwnerRepository.getAllExpectedschool();
        } else if (user.getRole() == ERole.ROLE_SCHOOL_OWNER) {
            so = schoolOwnerRepository.getExpectedSchoolByUserId(id);
        } else {
            throw new AuthenticationFailedException("Something went wrong! Cannot find role");
        }
        List<ExpectedSchoolVO> expectedSchools = new ArrayList<>();
        for (Object[] temp : so) {
            expectedSchools.add(new ExpectedSchoolVO((String) temp[0], (String) temp[1]));
        }
        return expectedSchools;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    @Override
    public Boolean mergeDraft(Integer schoolId) {
        // 1. Retrieve the draft school data
        School draft = schoolRepository.findByIdWithDraft(schoolId);
        if (draft == null) return false;

        // 2. Retrieve the original school and old media
        School originSchool = draft.getOriginalSchool();
        if (originSchool == null) return false;
        List<Media> oldMedias = mediaRepository.getAllBySchool(originSchool);

        // 3. Update the original school with data from the draft
        try {
            // Copy properties from draft to origin school, excluding certain fields
            BeanUtils.copyProperties(
                    draft,
                    originSchool,
                    "id",
                    "originalSchool",
                    "draft",
                    "status",
                    "postedDate",
                    "schoolOwners",
                    "reviews"
            );

            // Update facilities and utilities to avoid shared references
            if (draft.getFacilities() != null) {
                originSchool.setFacilities(new HashSet<>(draft.getFacilities()));
            }
            if (draft.getUtilities() != null) {
                originSchool.setUtilities(new HashSet<>(draft.getUtilities()));
            }
            originSchool = schoolRepository.save(originSchool);
            // Save the media (images) associated with the draft
            if (draft.getImages() != null) {
                List<Media> images = new ArrayList<>();
                for (Media media : draft.getImages()) {
                    media.setSchool(originSchool); // Set the origin school for each media
                    mediaRepository.save(media);   // Ensure the media is saved
                    images.add(media);
                }
                originSchool.setImages(images);
            }

            // Update school owners, saving any transient owners
//            if (draft.getSchoolOwners() != null) {
//                Set<SchoolOwner> updatedSchoolOwners = new HashSet<>(draft.getSchoolOwners());
//                for (SchoolOwner owner : updatedSchoolOwners) {
//                    if (owner.getId() == null) {
//                        schoolOwnerRepository.save(owner); // Save transient owners
//                    }
//                    owner.setSchool(originSchool); // Set the relationship with origin school
//                }
//                originSchool.setSchoolOwners(updatedSchoolOwners);
//            }

            // Remove the draft reference before saving
            originSchool.setDraft(null);
        } catch (Exception e) {
            log.error("Error copying properties: {}", e.getMessage());
            return false;
        }

        // 7. Update school of school owners
        // 5. Handle school owners
        Set<SchoolOwner> schoolOwners = schoolOwnerRepository.findBySchoolIdAndDraftId(originSchool.getId(), draft.getId());
        Set<SchoolOwner> updatedOwners = new HashSet<>();

        for (SchoolOwner owner : schoolOwners) {
            if (owner.getDraft() == null) {
                owner.setSchool(null);
            } else {
                owner.setSchool(originSchool);
            }
            updatedOwners.add(schoolOwnerRepository.save(owner));
        }
        originSchool.setSchoolOwners(updatedOwners);

        // 4. Save the updated origin school and flush to the database
        originSchool.setDraft(null);
        schoolRepository.saveAndFlush(originSchool);

        // 5. Delete the draft after the origin school is saved
        List<SchoolOwner> draftOwners = schoolOwnerRepository.findAllByDraft(draft); // or findByDraftId(...)
        for (SchoolOwner owner : draftOwners) {
            owner.setDraft(null);
        }
        schoolOwnerRepository.saveAll(draftOwners);

        schoolRepository.delete(draft);

        // 6. Delete old images from cloud and database
        if (!oldMedias.isEmpty()) {
            for (Media media : oldMedias) {
                try {
                    imageService.deleteUploadedImage(media.getCloudId()); // Delete the image from the cloud
                } catch (Exception e) {
                    return false;
                }
            }
            mediaRepository.deleteAll(oldMedias); // Delete the media from the database
        }

        return true;
    }

    @Override
    public Boolean isDraft(Integer schoolId) {
        School draft = schoolRepository.findById(schoolId).orElseThrow(SchoolNotFoundException::new);
        return draft.getOriginalSchool() != null;
    }

    @Override
    public Page<SchoolSearchVO> searchSchoolByCriteria(SchoolSearchDTO schoolSearchDTO) {
        Specification<School> spec = Specification.<School>where(null)
                .and(SchoolSpecification.hasName(schoolSearchDTO.name()))
                .and(SchoolSpecification.hasType(schoolSearchDTO.type()))
                .and(SchoolSpecification.hasReceivingAge(schoolSearchDTO.age()))
                .and(SchoolSpecification.hasFeeRange(schoolSearchDTO.minFee(), schoolSearchDTO.maxFee()))
                .and(SchoolSpecification.hasAllFacilitiesAndUtilities(schoolSearchDTO.facilityIds(), schoolSearchDTO.utilityIds()))
                .and(SchoolSpecification.hasProvince(schoolSearchDTO.province()))
                .and(SchoolSpecification.hasDistrict(schoolSearchDTO.district()));

        String directionStr = schoolSearchDTO.sortDirection();
        Sort.Direction direction = directionStr == null || "desc".equalsIgnoreCase(directionStr)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable;

        if ("rating".equalsIgnoreCase(schoolSearchDTO.sortBy())) {
            // Xử lý riêng cho rating
            spec = spec.and(SchoolSpecification.hasRatingSort(
                    direction == Sort.Direction.DESC ? "desc" : "asc"
            ));
            pageable = PageRequest.of(schoolSearchDTO.page(), schoolSearchDTO.size());
        } else {
            // Các trường hợp sắp xếp thông thường
            pageable = PageRequest.of(
                    schoolSearchDTO.page(),
                    schoolSearchDTO.size(),
                    Sort.by(direction, schoolSearchDTO.sortBy())
            );
        }

        Page<School> schoolPage = schoolRepository.findAll(spec, pageable);
        return schoolPage.map(school -> schoolMapper.toSchoolSearchVO(school, reviewMapper));
    }

    @Override
    public Page<SchoolSearchNativeVO> searchSchoolByCriteriaWithNative(SchoolSearchDTO dto) {
        // Calculate the offset for pagination based on the current page and page size
        int offset = dto.page() * dto.size();

        List<Object[]> rawResults; // Hold raw SQL result rows as Object arrays
        long total; // Hold the total number of matching results

        // Determine if the query needs to filter by facility or utility
        boolean hasFacility = dto.facilityIds() != null && !dto.facilityIds().isEmpty();
        boolean hasUtility = dto.utilityIds() != null && !dto.utilityIds().isEmpty();
        boolean shouldUseFullQuery = hasFacility || hasUtility;

        if (shouldUseFullQuery) {
            // If filtering by facilities or utilities, use the complex query
            int facilitySize = hasFacility ? dto.facilityIds().size() : 0;
            int utilitySize = hasUtility ? dto.utilityIds().size() : 0;

            // Run the native SQL query that joins facilities/utilities and returns raw result
            rawResults = schoolRepository.searchSchoolsWithFacilityAndUtilityRaw(
                    dto.name(), dto.type(), dto.age(), dto.minFee(), dto.maxFee(),
                    dto.province(), dto.district(),
                    dto.facilityIds(), dto.utilityIds(),
                    facilitySize, utilitySize,
                    dto.sortBy(), dto.sortDirection(),
                    dto.size(), offset
            );

            // Count total schools that match the filters (with facility/utility filters applied)
            total = schoolRepository.countSchoolsWithFacilityAndUtility(
                    dto.name(), dto.type(), dto.age(), dto.minFee(), dto.maxFee(),
                    dto.province(), dto.district(),
                    dto.facilityIds(), dto.utilityIds(),
                    facilitySize, utilitySize
            );
        } else {
            // If no facility/utility filter, run simpler query (no joins)
            rawResults = schoolRepository.searchSchoolsBasicRaw(
                    dto.name(), dto.type(), dto.age(), dto.minFee(), dto.maxFee(),
                    dto.province(), dto.district(),
                    dto.sortBy(), dto.sortDirection(),
                    dto.size(), offset
            );

            // Count total schools matching the basic filters
            total = schoolRepository.countSchoolsBasic(
                    dto.name(), dto.type(), dto.age(), dto.minFee(), dto.maxFee(),
                    dto.province(), dto.district()
            );
        }

        // Convert each Object[] row into SchoolSearchNativeVO using a custom constructor
        List<SchoolSearchNativeVO> results = rawResults.stream()
                .map(SchoolSearchNativeVO::new)
                .toList();

        // Return paginated result as a Spring Data Page
        return new PageImpl<>(results, PageRequest.of(dto.page(), dto.size()), total);
    }

    @Override
    public Page<SchoolListVO> getAllSchools(String name, String province, String district,
                                            String street, String email, String phone, Pageable pageable) {
        Page<School> schoolPage = schoolRepository.findSchools(name, province, district, street, email, phone, pageable);
        return schoolPage.map(schoolMapper::toSchoolListVO);
    }

    @Override
    public SchoolDetailVO getSchoolByUserId(Integer userId) {
        School school = schoolRepository.findSchoolByUserIdAndStatusNotDelete(userId)
                .orElseThrow(() -> new RuntimeException("School not found for user ID: " + userId));
        List<SchoolOwnerVO> schoolOwnerVOList = findSchoolOwnerBySchool(school.getId());
        return schoolMapper.toSchoolDetailVOWithSchoolOwners(school, schoolOwnerVOList);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    public SchoolDetailVO getDraft(User user) {
        Integer userId = user.getId();
        SchoolOwner so = schoolOwnerRepository.findWithSchoolAndDraftByUserId(userId).orElseThrow(UserNotFoundException::new);
        School school = so.getSchool();
        if (school == null) throw new SchoolNotFoundException();
        School draft = school.getDraft();
        List<SchoolOwnerVO> schoolOwnerVOList = findSchoolOwnerByDraft(draft.getId());
        return schoolMapper.toSchoolDetailVOWithSchoolOwners(draft, schoolOwnerVOList);
    }

    @Override
    public List<SchoolOwnerVO> findSchoolOwnerByDraft(Integer id) {
        List<SchoolOwnerProjection> projections = schoolOwnerRepository.searchSchoolOwnersByDraftId(id);
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
    public SchoolDetailVO getPublicSchoolInfo(Integer schoolId) {
        School school = schoolRepository.findSchoolBySchoolId(schoolId).orElseThrow(SchoolNotFoundException::new);
        return schoolMapper.toSchoolDetailVO(school);
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
        String response = changeSchoolStatusDTO.response();

        // Retrieve the school entity by ID, or throw an exception if not found
        School school = schoolRepository.findById(schoolID)
                .orElseThrow(SchoolNotFoundException::new);

        Byte currentSchoolStatus = school.getStatus();
        String currentSchoolEmail = school.getEmail();
        String currentSchoolName = school.getName();

        User user = userService.getCurrentUser();
        String username = user.getUsername();

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
                    eventPublisher.publishEvent(new SchoolRejectedEvent(currentSchoolEmail, currentSchoolName, response));
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

            case 6 -> {
                // Change to "Deleted" status
                school.setStatus(preparedStatus);
                List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolID);

                for (SchoolOwner so : schoolOwners) {
                    so.setSchool(null);
                    schoolOwnerRepository.saveAndFlush(so);
                }
                eventPublisher.publishEvent(new SchoolDeletedEvent(currentSchoolEmail, currentSchoolName, response));
            }

            default -> throw new StatusNotExistException("Status does not exist");

        }
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    @Transactional
    public void updateSchoolStatusBySchoolOwner(ChangeSchoolStatusDTO changeSchoolStatusDTO) {
        User user = userService.getCurrentUser();
        String username = user.getUsername();
        SchoolOwner currentOwner = schoolOwnerRepository.findByUserId(user.getId()).orElseThrow();
        Boolean publicPermission = currentOwner.getPublicPermission();
        Integer ownedSchoolID = currentOwner.getSchool().getId();

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
                    List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(ownedSchoolID);

                    for (SchoolOwner so : schoolOwners) {
                        so.setSchool(null);
                        schoolOwnerRepository.saveAndFlush(so);
                    }

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
        log.info("email: {}, schoolId: {}", email, schoolId);
        return schoolRepository.existsByEmailExcept(email, schoolId);
    }

    @Override
    public boolean checkPhoneExists(String phone) {
        return schoolRepository.existsByPhone(phone);
    }

}
