package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.vo.SchoolVO;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.model.vo.ImageVO;
import fa.pjb.back.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("school")
public class SchoolController {
    private final SchoolService schoolService;
    private final GGDriveImageService imageService;

    @GetMapping("/{schoolId}")
    public ApiResponse<SchoolVO> getSchoolInfo(@PathVariable Integer schoolId) {
        log.info("=========== school controller ===============");
        return ApiResponse.<SchoolVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get school information successfully.")
                .data(schoolService.getSchoolInfo(schoolId))
                .build();
    }

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SchoolVO> addSchool(
            @RequestPart(value = "data") @Valid AddSchoolDTO schoolDTO,
            @RequestPart(value = "image", required = false) List<MultipartFile> image) throws IOException {

        return ApiResponse.<SchoolVO>builder()
                .code(HttpStatus.CREATED.value())
                .message("School Created!")
                .data(schoolService.addSchool(schoolDTO,image))
                .build();
    }
}
