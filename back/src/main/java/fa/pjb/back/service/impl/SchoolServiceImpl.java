package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.InappropriateSchoolStatusException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._13xx_school.StatusNotExistException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.common.exception._14xx_data.UploadFileException;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.hibernate.Hibernate;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

import static fa.pjb.back.model.enums.FileFolderEnum.SCHOOL_IMAGES;
import static fa.pjb.back.model.enums.SchoolStatusEnum.APPROVED;
import static fa.pjb.back.model.enums.SchoolStatusEnum.SUBMITTED;

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
    private static final Tika tika = new Tika();
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

    private void processAndSaveImages(List<MultipartFile> image, School school) {
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
                    "School_" + school.getId() + "Image_",
                    SCHOOL_IMAGES, imageService::uploadImage
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
                        .school(school)
                        .build();
                mediaList.add(media);
            }
        }
        mediaRepository.saveAll(mediaList);
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
        School school = prepareSchoolData(schoolDTO, user, new School());

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

    private School prepareSchoolData(SchoolDTO schoolDTO, User user, School oldSchool) {
        log.info("begin prepareSchoolData");

        // Check if email already exists
        if (schoolDTO.id() == null) {
            if (checkEmailExists(schoolDTO.email())) {
                throw new EmailAlreadyExistedException("This email is already in use");
            }
        } else {
            if (checkEditingEmailExists(schoolDTO.email(), schoolDTO.id())) {
                throw new EmailAlreadyExistedException("This email is already in use");
            }
        }
        log.info("1");

        School school = schoolMapper.toSchool(schoolDTO, oldSchool);
        log.info("2");

        school.setPostedDate(LocalDate.now());
        log.info("2.1");
        log.info("school: {}", school.toString());

        // Validate facilities
        if (schoolDTO.facilities() != null) {
            Set<Facility> existingFacilities = facilityRepository.findAllByFidIn(schoolDTO.facilities());
            if (existingFacilities.size() != schoolDTO.facilities().size()) {
                throw new InvalidDataException("Some facilities do not exist in the database");
            }
            school.setFacilities(existingFacilities);
        }
        log.info("3");

        // Validate utilities
        if (schoolDTO.utilities() != null) {
            Set<Utility> existingUtilities = utilityRepository.findAllByUidIn(schoolDTO.utilities());
            if (existingUtilities.size() != schoolDTO.utilities().size()) {
                throw new InvalidDataException("Some utilities do not exist in the database");
            }
            school.setUtilities(existingUtilities);
        }
        log.info("4");

        // Update all SchoolOwners with the saved School and batch-save them
        if (schoolDTO.schoolOwners() != null && !schoolDTO.schoolOwners().isEmpty()) {
            Set<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllByIdIn(schoolDTO.schoolOwners());
            if (schoolOwners.size() != schoolDTO.schoolOwners().size()) {
                throw new IllegalArgumentException("One or more SchoolOwner IDs not found");
            }
            for (SchoolOwner owner : schoolOwners) {
                owner.setSchool(school); // Không dùng lambda để tránh lỗi
            }
            school.setSchoolOwners(schoolOwners);
        } else {
            school.setSchoolOwners(new HashSet<>());
        }
        log.info("5");
        log.info("school: {}", school.toString());

        // Delete old images
        List<Media> oldMedias = mediaRepository.getAllBySchool(school);
        log.info("6");

        if (!oldMedias.isEmpty()) {
            log.info("7");

            for (Media media : oldMedias) {
                // Delete images from Google Drive
                FileUploadVO deleteResponse = imageService.deleteUploadedImage(media.getCloudId());
            }
            school.getImages().clear();
            log.info("8");
            mediaRepository.deleteAllBySchool(school);
            log.info("9");

        }
        log.info("finish prepareSchoolData");
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
        if (!(principal instanceof User user)) {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        // Update entity fields from DTO
        School school = prepareSchoolData(schoolDTO, user, oldSchool);
        school.setStatus(curStatus);

        // Handle new uploaded images
        if (images != null && !images.isEmpty()) {
            processAndSaveImages(images, school);
        }
        // Save the updated school data
        schoolRepository.save(school);

        return schoolMapper.toSchoolDetailVO(school);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Transactional
    @Override
    public SchoolDetailVO updateSchoolBySchoolOwner(SchoolDTO schoolDTO, List<MultipartFile> images) {
        log.info("++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Kiểm tra nếu người dùng không phải là School Owner
        if (!(principal instanceof User user)) {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        log.info("User: {}", user.toString());

        // Lấy SchoolOwner từ user ID
        SchoolOwner schoolOwner = schoolOwnerRepository
                .findWithSchoolAndDraftByUserId(user.getId())
                .orElseThrow(UserNotFoundException::new);

        // Kiểm tra nếu school tồn tại
        School currentSchool = schoolOwner.getSchool();
        if (currentSchool == null) {
            throw new SchoolNotFoundException();
        }
        log.info("Current school: {}", currentSchool.toString());

        // Kiểm tra nếu đã có draft
        School draft = currentSchool.getDraft();

        if (currentSchool.getStatus().equals(SUBMITTED.getValue()) || (draft != null && draft.getStatus().equals(SUBMITTED.getValue()))) {
            throw new IllegalStateException("Cannot update a submitted school or draft");
        }

        if (draft == null) {
            log.info("No draft found, creating a new draft...");

            // Tạo một School mới làm draft
            draft = new School();
            draft.setStatus(SUBMITTED.getValue()); // Đặt trạng thái là SUBMITTED
            draft.setOriginalSchool(currentSchool);
        } else {
            log.info("Draft found, updating existing draft...");
        }

        // Cập nhật dữ liệu từ DTO vào draft
        log.info("Before updating draft, ID: {}", draft.getId());
        schoolMapper.toDraft(schoolDTO, draft);
        log.info("After updating draft, ID: {}", draft.getId());
        log.info("Draft saved with ID: {}", draft.getId());
// Validate facilities
        if (schoolDTO.facilities() != null) {
            Set<Facility> existingFacilities = facilityRepository.findAllByFidIn(schoolDTO.facilities());
            if (existingFacilities.size() != schoolDTO.facilities().size()) {
                throw new InvalidDataException("Some facilities do not exist in the database");
            }
            draft.setFacilities(existingFacilities);
        }
        log.info("3");

        // Validate utilities
        if (schoolDTO.utilities() != null) {
            Set<Utility> existingUtilities = utilityRepository.findAllByUidIn(schoolDTO.utilities());
            if (existingUtilities.size() != schoolDTO.utilities().size()) {
                throw new InvalidDataException("Some utilities do not exist in the database");
            }
            draft.setUtilities(existingUtilities);
        }
        log.info("4");

        // Update all SchoolOwners with the saved School and batch-save them
        if (schoolDTO.schoolOwners() != null && !schoolDTO.schoolOwners().isEmpty()) {
            Set<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllByIdIn(schoolDTO.schoolOwners());
            if (schoolOwners.size() != schoolDTO.schoolOwners().size()) {
                throw new IllegalArgumentException("One or more SchoolOwner IDs not found");
            }
            for (SchoolOwner owner : schoolOwners) {
                owner.setSchool(draft); // Không dùng lambda để tránh lỗi
            }
            draft.setSchoolOwners(schoolOwners);
        } else {
            draft.setSchoolOwners(new HashSet<>());
        }
        // Xử lý hình ảnh nếu có
        if (images != null && !images.isEmpty()) {
            processAndSaveImages(images, draft);
        }
        draft.setPostedDate(LocalDate.now());
        // Lưu draft vào DB
        draft = schoolRepository.save(draft);
        log.info("Update by school owner completed.");
        return schoolMapper.toSchoolDetailVO(draft);
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
        //  schoolPage.forEach(school -> log.info("School: id={}, postedDate={}", school.getId(), school.getPostedDate()));
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
                if (school.getStatus() == 1) {
                    school.setStatus(preparedStatus);
                    emailService.sendSchoolApprovedEmail(school.getEmail(), school.getName(), schoolDetailedLink);
                } else {
                    throw new InappropriateSchoolStatusException();
                }
            }

            case 3 -> {
                // Change to "Rejected" status if current status is "Submitted"
                if (school.getStatus() == 1) {
                    school.setStatus(preparedStatus);
                    emailService.sendSchoolRejectedEmail(school.getEmail(), school.getName());
                } else {
                    throw new InappropriateSchoolStatusException();
                }
            }

            case 4 -> {
                // Change to "Published" status if current status is "Approved"
                if (school.getStatus() == 2 || school.getStatus() == 5) {

                    school.setStatus(preparedStatus);

                    // Set public permission to true for all school owners relate to current school
                    List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolID);

                    for (SchoolOwner so : schoolOwners) {
                        so.setPublicPermission(true);
                        schoolOwnerRepository.saveAndFlush(so);
                    }
                    emailService.sendSchoolPublishedEmail(school.getEmail(), school.getName(), username, schoolDetailedLink);
                } else {
                    throw new InappropriateSchoolStatusException();
                }

            }

            case 5 -> {
                //Change to "Unpublished" status if current status is "Published"
                if (school.getStatus() == 4) {

                    school.setStatus(preparedStatus);

                    // Set public permission to false for all school owners relate to current school
                    List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolID);

                    for (SchoolOwner so : schoolOwners) {
                        so.setPublicPermission(false);
                        schoolOwnerRepository.saveAndFlush(so);
                    }

                } else {
                    log.info("InappropriateSchoolStatusException");
                    throw new InappropriateSchoolStatusException();
                }
            }

            case 6 -> {
                // Change to "Deleted" status
                school.setStatus(preparedStatus);
            }

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
                        emailService.sendSchoolPublishedEmail(school.getEmail(), school.getName(), username, schoolDetailedLink);
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
        return schoolRepository.existsByEmailExcept(email, schoolId);
    }

    @Override
    public boolean checkPhoneExists(String phone) {
        return schoolRepository.existsByPhone(phone);
    }


}
