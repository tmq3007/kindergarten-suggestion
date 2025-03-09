package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.InappropriateSchoolStatusException;
import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.common.exception._14xx_data.PhoneExistedException;
import fa.pjb.back.common.exception._14xx_data.UploadFileException;
import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.ImageVO;
import fa.pjb.back.model.vo.SchoolListVO;
import fa.pjb.back.model.vo.SchoolVO;
import fa.pjb.back.repository.*;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.SchoolService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

import static fa.pjb.back.model.enums.FileFolderEnum.SCHOOL_IMAGES;


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
    private final EmailService emailService;
    private final GGDriveImageService imageService;
    private final SchoolOwnerRepository schoolOwnerRepository;
    private static final Tika tika = new Tika();
    @Value("${school-detailed-link}")
    private String schoolDetailedLink;


    @Override
    public SchoolVO getSchoolInfo(Integer schoolId) {
        School school = schoolRepository.findById(schoolId).orElseThrow(SchoolNotFoundException::new);
        return schoolMapper.toSchoolVO(school);
    }

    @Transactional
    @Override
    public SchoolVO addSchool(AddSchoolDTO schoolDTO, List<MultipartFile> image) {
        if(checkEmailExists(schoolDTO.email())){
            throw new EmailAlreadyExistedException("This email is already in used");
        }
        if(checkPhoneExists(schoolDTO.phone())){
            throw new PhoneExistedException("This phone is already in used");
        }
        School school = schoolMapper.toSchool(schoolDTO);
        List<ImageVO> imageVOList = null;

        //Get existing facilities from DB
        Set<Facility> existingFacilities = facilityRepository.findAllByFidIn(schoolDTO.facilities());

        //Validate: Check if all requested fids exist in the database
        if (existingFacilities.size() != school.getFacilities().size()) {
            throw new InvalidDataException("Some facilities do not exist in the database");
        }
        //Get existing utilities from DB
        Set<Utility> existingUtilities = utilityRepository.findAllByUidIn(schoolDTO.utilities());

        //Validate: Check if all requested uids exist in the database
        if (existingUtilities.size() != school.getUtilities().size()) {
            throw new InvalidDataException("Some utilities do not exist in the database");
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
                        "School_"+newSchool.getId()+"Image_",
                        SCHOOL_IMAGES
                );
            } catch (IOException e) {
                throw new UploadFileException("Error while uploading images" + e.getMessage());
            }
            List<Media> temp = new ArrayList<>();
            for (ImageVO imageVO : imageVOList) {
                if (imageVO.status() == 200) {
                    Media media = new Media();
                    media.setUrl(imageVO.url());
                    media.setSize(String.valueOf(imageVO.size()));
                    media.setCloudId(imageVO.fileId());
                    media.setFilename(imageVO.fileName());
                    media.setType("image/png");
                    media.setUploadTime(LocalDate.now());
                    media.setSchool(newSchool);
                    temp.add(media);
                }
            }
            mediaRepository.saveAll(temp);
        }

        return schoolMapper.toSchoolVO(newSchool);
    }

    @Override
    public Page<SchoolListVO> getAllSchools(String name, String province, String district,
                                            String street, String email, String phone, Pageable pageable) {
        log.info("=========== school service: getAllSchools ===============");
        Page<School> schoolPage = schoolRepository.findSchools(name, province, district, street, email, phone, pageable);
        return schoolPage.map(schoolMapper::toSchoolListVO);
    }

    @Override
    public Page<SchoolVO> getSchoolsByUserId(Integer userId, Pageable pageable, String name) {
        log.info("=========== school service: getSchoolsByUserId ===============");
        Page<School> schoolPage = schoolRepository.findSchoolsByUserId(userId, name, pageable);
        return schoolPage.map(schoolMapper::toSchoolVO);
    }

    /**
     * Updates the status of a school based on the provided status code.
     **/
    @Override
    @Transactional
    public void updateSchoolStatus(Integer schoolID, ChangeSchoolStatusDTO changeSchoolStatusDTO) {
        // Retrieve the school entity by ID, or throw an exception if not found
        School school = schoolRepository.findById(schoolID)
                .orElseThrow(SchoolNotFoundException::new);

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String username;
        String role;
        Boolean publicPermission = true;

        // Check if principal is an instance of User entity
        if (principal instanceof User user) {
            role = String.valueOf(user.getRole());
            username = user.getUsername();
            if(role.equals("ROLE_SCHOOL_OWNER")){

                publicPermission = schoolOwnerRepository.findById(user.getId()).orElseThrow().getPublicPermission();

            }
        } else {
            throw new AuthenticationFailedException("Cannot authenticate");
        }

        switch (changeSchoolStatusDTO.status()) {

            case 2 -> {
                if(role.equals("ROLE_ADMIN")){
                    // Change to "Approved" status if current status is "Submitted"
                    if (school.getStatus() == 1) {
                        school.setStatus(changeSchoolStatusDTO.status());
                        emailService.sendSchoolApprovedEmail(school.getEmail(), school.getName(), schoolDetailedLink + schoolID);
                    } else {
                        throw new InappropriateSchoolStatusException();
                    }
                } else {
                    throw new AuthenticationFailedException("You do not have permission to approve the school");
                }
            }

            case 3 -> {
                if(role.equals("ROLE_ADMIN")){
                    // Change to "Rejected" status if current status is "Submitted"
                    if (school.getStatus() == 1) {
                        school.setStatus(changeSchoolStatusDTO.status());
                        emailService.sendSchoolRejectedEmail(school.getEmail(), school.getName());
                    } else {
                        throw new InappropriateSchoolStatusException();
                    }
                } else {
                    throw new AuthenticationFailedException("You do not have permission to reject the school");
                }
            }

            case 4 -> {

                // Check if the principal is an admin or school owner with public permission
                if (role.equals("ROLE_SCHOOL_OWNER") && publicPermission) {
                    // Change to "Published" status if current status is "Approved" or "Unpublished"
                    if (school.getStatus() == 2 || school.getStatus() == 5) {
                        school.setStatus(changeSchoolStatusDTO.status());
                        emailService.sendSchoolPublishedEmail(school.getEmail(), school.getName(), username, schoolDetailedLink + schoolID);
                    } else {
                        throw new InappropriateSchoolStatusException();
                    }
                }

                else if(role.equals("ROLE_ADMIN")){
                    if (school.getStatus() == 2 || school.getStatus() == 5) {

                        school.setStatus(changeSchoolStatusDTO.status());

                        // Set public permission to true for all school owners relate to current school
                        List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolID);
                        for (SchoolOwner so : schoolOwners) {
                            so.setPublicPermission(true);
                        }
                        emailService.sendSchoolPublishedEmail(school.getEmail(), school.getName(), username, schoolDetailedLink + schoolID);
                    } else {
                        throw new InappropriateSchoolStatusException();
                    }
                } else {
                    throw new AuthenticationFailedException("You do not have permission to publish the school");
                }

            }

            case 5 -> {

                // Check if the principal is a school owner
                if (role.equals("ROLE_SCHOOL_OWNER")) {
                    // Change to "Unpublished" status if current status is "Published"
                    if (school.getStatus() == 4) {
                        school.setStatus(changeSchoolStatusDTO.status());
                    } else {
                        throw new InappropriateSchoolStatusException();
                    }
                }

                else if (role.equals("ROLE_ADMIN")){
                    // Change to "Unpublished" status if current status is "Published"
                    if (school.getStatus() == 4) {

                        school.setStatus(changeSchoolStatusDTO.status());

                        // Set public permission to false for all school owners relate to current school
                        List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolID);
                        for (SchoolOwner so : schoolOwners) {
                            so.setPublicPermission(false);
                        }
                    } else {
                        throw new InappropriateSchoolStatusException();
                    }
                } else {
                    throw new AuthenticationFailedException("You do not have permission to publish the school");
                }


            }

            case 6 -> {
                if (role.equals("ROLE_ADMIN")) {
                    // Change to "Deleted" status
                    school.setStatus(changeSchoolStatusDTO.status());
                }
                else if (role.equals("ROLE_SCHOOL_OWNER") && school.getStatus() == 0) {

                        school.setStatus(changeSchoolStatusDTO.status());

                }
                else {
                    throw new AuthenticationFailedException("You do not have permission to delete the school");
                }
            }
        }
    }

    @Override
    public boolean checkEmailExists(String email) {
        return schoolRepository.existsByEmail(email);
    }

    @Override
    public boolean checkPhoneExists(String phone) {
        return schoolRepository.existsByPhone(phone);
    }

    @Override
    public SchoolVO editSchoolByAdmin(AddSchoolDTO schoolDTO, List<MultipartFile> image) {
        return null;
    }
}
