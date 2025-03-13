package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.InappropriateSchoolStatusException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.common.exception._14xx_data.UploadFileException;
import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.SchoolUpdateDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.mapper.SchoolOwnerProjection;
import fa.pjb.back.model.vo.*;
import fa.pjb.back.repository.*;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.SchoolService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static fa.pjb.back.model.enums.FileFolderEnum.SCHOOL_IMAGES;
import static fa.pjb.back.model.enums.SchoolStatusEnum.APPROVED;
import static fa.pjb.back.model.enums.SchoolStatusEnum.SUBMITTED;

@Slf4j
@RequiredArgsConstructor
@Service
public class SchoolServiceImpl implements SchoolService {
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/gif");

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


    @Override
    public SchoolDetailVO getSchoolInfo(Integer schoolId) {
        School school = schoolRepository.findById(schoolId).orElseThrow(SchoolNotFoundException::new);
        return schoolMapper.toSchoolDetailVO(school);
    }

    private void processAndSaveImages(List<ImageVO> imageVOList, School school) {
        List<Media> mediaList = new ArrayList<>();
        for (ImageVO imageVO : imageVOList) {
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

    //TODO: add school based on user role and id
    @Transactional
    @Override
    public SchoolDetailVO addSchool(AddSchoolDTO schoolDTO, List<MultipartFile> image) {
        if (checkEmailExists(schoolDTO.email())) {
            throw new EmailAlreadyExistedException("This email is already in used");
        }
        School school = schoolMapper.toSchool(schoolDTO);
        List<ImageVO> imageVOList = null;
        if (schoolDTO.facilities() != null) {
            //Get existing facilities from DB
            Set<Facility> existingFacilities = facilityRepository.findAllByFidIn(schoolDTO.facilities());
            //Validate: Check if all requested fids exist in the database
            if (existingFacilities.size() != school.getFacilities().size()) {
                throw new InvalidDataException("Some facilities do not exist in the database");
            }
        }
        if (schoolDTO.utilities() != null) {
            //Get existing utilities from DB
            Set<Utility> existingUtilities = utilityRepository.findAllByUidIn(schoolDTO.utilities());
            //Validate: Check if all requested uids exist in the database
            if (existingUtilities.size() != school.getUtilities().size()) {
                throw new InvalidDataException("Some utilities do not exist in the database");
            }
        }
        // If the submit user is admin then auto change status to approved
        User user = userRepository.findById(schoolDTO.userId()).orElseThrow(() -> new AuthenticationFailedException("Cannot authenticate"));

        if (user.getRole() == ERole.ROLE_ADMIN && schoolDTO.status() == SUBMITTED.getValue()) {
            school.setStatus((byte) APPROVED.getValue());
        }
        school.setPostedDate(LocalDate.now());
        School newSchool = schoolRepository.save(school);

        // Validate and upload images (if provided)
        if (image != null) {
            for (MultipartFile file : image) {
                // Check file size
                if (file.getSize() > MAX_FILE_SIZE) {
                    throw new InvalidFileFormatException("File cannot exceed 5MB");
                }
                // Check file type
                try {
                    String mimeType = tika.detect(file.getBytes()); // Detect MIME type
                    if (!ALLOWED_MIME_TYPES.contains(mimeType)) {
                        throw new InvalidFileFormatException("Invalid file type: " + file.getOriginalFilename() + ". Allowed: JPEG, PNG, GIF.");
                    }
                } catch (IOException e) {
                    throw new InvalidFileFormatException("Error when processing file");
                }
            }

            //Upload images
            try {
                imageVOList = imageService.uploadListImages(
                        imageService.convertMultiPartFileToFile(image),
                        "School_" + newSchool.getId() + "Image_",
                        SCHOOL_IMAGES
                );
            } catch (IOException e) {
                throw new UploadFileException("Error while uploading images" + e.getMessage());
            }
            processAndSaveImages(imageVOList, newSchool);
        }

        //Send submit emails to admins
        if (user.getRole() == ERole.ROLE_SCHOOL_OWNER && newSchool.getStatus() == SUBMITTED.getValue()) {
            //TODO:Fix this to email
            emailService.sendSubmitSchool("nguyendatrip123@gmail.com", newSchool.getName(), user.getUsername(), schoolDetailedLink + newSchool.getId());
        }
        return schoolMapper.toSchoolDetailVO(newSchool);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    @Override
    public SchoolDetailVO updateSchoolByAdmin(SchoolUpdateDTO schoolDTO, List<MultipartFile> images) {
        // Check if the school exists
        School school = schoolRepository.findById(schoolDTO.id())
                .orElseThrow(SchoolNotFoundException::new);

        // Update entity fields from DTO
        schoolMapper.updateSchoolFromDto(schoolDTO, school);

        // Update facilities
        Set<Facility> existingFacilities = facilityRepository.findAllByFidIn(schoolDTO.facilities());
        if (existingFacilities.size() != schoolDTO.facilities().size()) {
            throw new InvalidDataException("Some facilities do not exist in the database");
        }
        school.setFacilities(existingFacilities);

        // Update utilities
        Set<Utility> existingUtilities = utilityRepository.findAllByUidIn(schoolDTO.utilities());
        if (existingUtilities.size() != schoolDTO.utilities().size()) {
            throw new InvalidDataException("Some utilities do not exist in the database");
        }
        school.setUtilities(existingUtilities);

        // ✅ Bước 1: Xóa tất cả ảnh cũ
        List<Media> oldMedias = mediaRepository.getAllBySchool(school);
        if (!oldMedias.isEmpty()) {
            for (Media media : oldMedias) {
                // Xóa ảnh khỏi Google Drive
                ImageVO deleteResponse = imageService.deleteUploadedImage(media.getCloudId());
                log.info("🗑 Deleted Image from Google Drive: {}", deleteResponse);
            }

            // Xóa ảnh khỏi database bằng cách cập nhật danh sách ảnh về rỗng
            school.getImages().clear();
            schoolRepository.save(school);

            // Xóa ảnh khỏi database bằng repository
            mediaRepository.deleteAllBySchool(school);
            log.info("🗑 Deleted all images from database for School ID={}", school.getId());
        }

        // ✅ Bước 2: Xử lý ảnh mới nếu có
        if (images != null && !images.isEmpty()) {
            log.info("📥 Uploading new images...");

            // Kiểm tra định dạng và dung lượng file
            for (MultipartFile file : images) {
                if (file.getSize() > MAX_FILE_SIZE) {
                    throw new InvalidFileFormatException("File cannot exceed 5MB");
                }
                try {
                    String mimeType = tika.detect(file.getBytes());
                    if (!ALLOWED_MIME_TYPES.contains(mimeType)) {
                        throw new InvalidFileFormatException("Invalid file type: " + file.getOriginalFilename());
                    }
                } catch (IOException e) {
                    throw new UploadFileException("Error processing file: " + e.getMessage());
                }
            }

            try {
                List<ImageVO> imageVOList = imageService.uploadListImages(
                        imageService.convertMultiPartFileToFile(images),
                        "School_" + school.getId() + "_Image_",
                        SCHOOL_IMAGES
                );
                processAndSaveImages(imageVOList, school);
            } catch (IOException e) {
                throw new UploadFileException("Error uploading images: " + e.getMessage());
            }
        }

        // Save the updated school data
        schoolRepository.save(school);
        return schoolMapper.toSchoolDetailVO(school);
    }


    @Override
    public List<SchoolOwnerVO> findSchoolOwnerForAddSchool(String searchParam) {
        List<SchoolOwnerProjection> projections = schoolOwnerRepository.searchSchoolOwners(searchParam, ERole.ROLE_SCHOOL_OWNER);

        // Convert projection to VO
        return projections.stream()
                .map(projection -> new SchoolOwnerVO(
                        projection.getId(),
                        projection.getUsername(),
                        projection.getEmail(),
                        projection.getExpectedSchool()
                ))
                .toList();
    }

    public List<ExpectedSchoolVO> findAllDistinctExpectedSchools() {
        return schoolOwnerRepository.findDistinctByExpectedSchoolIsNotNull();
    }


    @Override
    public Page<SchoolListVO> getAllSchools(String name, String province, String district,
                                            String street, String email, String phone, Pageable pageable) {
        Page<School> schoolPage = schoolRepository.findSchools(name, province, district, street, email, phone, pageable);
        return schoolPage.map(schoolMapper::toSchoolListVO);
    }

    @Override
    public SchoolDetailVO getSchoolByUserId(Integer userId, String name) {
        School school = schoolRepository.findSchoolByUserId(userId, name)
                .orElseThrow(() -> new RuntimeException("School not found for user ID: " + userId));
        return schoolMapper.toSchoolDetailVO(school);
    }

    /**
     * Updates the status of a school based on the provided status code.
     **/

//    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    @Transactional
    public void updateSchoolStatusByAdmin(Integer schoolID, ChangeSchoolStatusDTO changeSchoolStatusDTO) {
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

        switch (changeSchoolStatusDTO.status()) {

            case 2 -> {
                // Change to "Approved" status if current status is "Submitted"
                if (school.getStatus() == 1) {
                    school.setStatus(changeSchoolStatusDTO.status());
                    emailService.sendSchoolApprovedEmail(school.getEmail(), school.getName(), schoolDetailedLink + schoolID);
                } else {
                    throw new InappropriateSchoolStatusException();
                }
            }

            case 3 -> {
                // Change to "Rejected" status if current status is "Submitted"
                if (school.getStatus() == 1) {
                    school.setStatus(changeSchoolStatusDTO.status());
                    emailService.sendSchoolRejectedEmail(school.getEmail(), school.getName());
                } else {
                    throw new InappropriateSchoolStatusException();
                }
            }

            case 4 -> {
                // Change to "Published" status if current status is "Approved"
                if (school.getStatus() == 2 || school.getStatus() == 5) {

                    school.setStatus(changeSchoolStatusDTO.status());

                    // Set public permission to true for all school owners relate to current school
                    List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolID);

                    for (SchoolOwner so : schoolOwners) {
                        so.setPublicPermission(true);
                        schoolOwnerRepository.saveAndFlush(so);
                    }
                    emailService.sendSchoolPublishedEmail(school.getEmail(), school.getName(), username, schoolDetailedLink + schoolID);
                } else {
                    throw new InappropriateSchoolStatusException();
                }

            }

            case 5 -> {
                //Change to "Unpublished" status if current status is "Published"
                if (school.getStatus() == 4) {

                    school.setStatus(changeSchoolStatusDTO.status());

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
                school.setStatus(changeSchoolStatusDTO.status());
            }
        }
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    @Transactional
    public void updateSchoolStatusBySchoolOwner(Integer schoolID, ChangeSchoolStatusDTO changeSchoolStatusDTO) {
        // Retrieve the school entity by ID, or throw an exception if not found
        School school = schoolRepository.findById(schoolID)
                .orElseThrow(SchoolNotFoundException::new);

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String username;

        Boolean publicPermission;

        // Check if principal is an instance of User entity
        if (principal instanceof User user) {

            username = user.getUsername();

            publicPermission = schoolOwnerRepository.findById(user.getId()).orElseThrow().getPublicPermission();

        } else {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        switch (changeSchoolStatusDTO.status()) {

            case 4 -> {

                // Check if public permission is true
                if (publicPermission) {
                    // Change to "Published" status if current status is "Approved" or "Unpublished"
                    if (school.getStatus() == 2 || school.getStatus() == 5) {
                        school.setStatus(changeSchoolStatusDTO.status());
                        emailService.sendSchoolPublishedEmail(school.getEmail(), school.getName(), username, schoolDetailedLink + schoolID);
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
                if (school.getStatus() == 0 || school.getStatus() == 1) {

                    school.setStatus(changeSchoolStatusDTO.status());

                }
            }
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
