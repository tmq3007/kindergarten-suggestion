package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.InvalidFileFormatException;
import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.ImageVO;
import fa.pjb.back.model.vo.SchoolVO;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.SchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


@Slf4j
@RequiredArgsConstructor
@Service
public class SchoolServiceImpl implements SchoolService {
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/gif");


    private final SchoolRepository schoolRepository;
    private final SchoolMapper schoolMapper;
    private final GGDriveImageService imageService;
    private static final Tika tika = new Tika();

    @Override
    public SchoolVO getSchoolInfo(Integer schoolId) {
        log.info("=========== school service ===============");
        School school = schoolRepository.findById(schoolId).orElseThrow(SchoolNotFoundException::new);
        return schoolMapper.toSchoolVO(school);
    }

    @Override
    public SchoolVO addSchool(AddSchoolDTO schoolDTO, List<MultipartFile> image) {
        School school = schoolMapper.toSchoolEntityFromAddSchoolDTO(schoolDTO);
        // Validate images (if provided)
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
        }
        try {
           List<ImageVO> imageVOList = imageService.uploadListImages(imageService.convertMultiPartFileToFile(image),"School_Image_");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return schoolMapper.toSchoolVO(school);
    }
}
