package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.SchoolVO;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.SchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
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
    private final GGDriveImageService imageService;
    private static final Tika tika = new Tika();

    @Override
    public SchoolVO getSchoolInfo(Integer schoolId) {
        log.info("=========== school service ===============");
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
        School school = schoolMapper.toSchoolEntityFromAddSchoolDTO(schoolDTO);
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

        school.setPosted_date(Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant()));
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
                    media.setFileId(imageVO.fileId());
                    media.setFilename(imageVO.fileName());
                    media.setType("image/png");
                    media.setUploadTime(Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant()));
                    media.setSchool(newSchool);
                    temp.add(media);
                }
            }
            mediaRepository.saveAll(temp);
        }

        return schoolMapper.toSchoolVO(newSchool);
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
