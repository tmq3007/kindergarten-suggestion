package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._11xx_email.EmailAlreadyExistedException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.common.exception._14xx_data.PhoneExistedException;
import fa.pjb.back.common.exception._14xx_data.UploadFileException;
import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.SchoolUpdateDTO;
import fa.pjb.back.model.entity.Facility;
import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.Utility;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.ImageVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.SchoolListVO;
import fa.pjb.back.repository.FacilityRepository;
import fa.pjb.back.repository.MediaRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.repository.UtilityRepository;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.SchoolService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

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
    private final GGDriveImageService imageService;
    private static final Tika tika = new Tika();

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
//        if (checkPhoneExists(schoolDTO.phone())) {
//            throw new PhoneExistedException("This phone is already in used");
//        }
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
                        "School_" + newSchool.getId() + "Image_",
                        SCHOOL_IMAGES
                );
            } catch (IOException e) {
                throw new UploadFileException("Error while uploading images" + e.getMessage());
            }
            processAndSaveImages(imageVOList, newSchool);
        }
        return schoolMapper.toSchoolDetailVO(newSchool);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    @Transactional
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

        // Process and update images if new images are uploaded
        if (images != null && !images.isEmpty()) {
            mediaRepository.deleteAllBySchool(school); // Remove old images

            // Validate and upload new images
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
    public Page<SchoolListVO> getAllSchools(String name, String province, String district,
                                            String street, String email, String phone, Pageable pageable) {
        Page<School> schoolPage = schoolRepository.findSchools(name, province, district, street, email, phone, pageable);
        return schoolPage.map(schoolMapper::toSchoolListVO);
    }

    @Override
    public Page<SchoolDetailVO> getSchoolsByUserId(Integer userId, Pageable pageable, String name) {
        Page<School> schoolPage = schoolRepository.findSchoolsByUserId(userId, name, pageable);
        return schoolPage.map(schoolMapper::toSchoolDetailVO);
    }

    @Override
    public boolean checkEmailExists(String email) {
        return schoolRepository.existsByEmail(email);
    }

    @Override
    public boolean checkPhoneExists(String phone) {
        return schoolRepository.existsByPhone(phone);
    }
}
