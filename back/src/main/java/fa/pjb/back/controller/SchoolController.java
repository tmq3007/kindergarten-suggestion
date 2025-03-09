package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.vo.SchoolListVO;
import fa.pjb.back.model.vo.SchoolVO;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.model.vo.ImageVO;
import fa.pjb.back.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/all")
    public ApiResponse<Page<SchoolListVO>> getAllSchools(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String province,
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String street,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String phone) {
        log.info("=========== school controller: getAllSchools ===============");
        Pageable pageable = PageRequest.of(page - 1, size);
        return ApiResponse.<Page<SchoolListVO>>builder()
            .code(HttpStatus.OK.value())
            .message("Get all schools successfully.")
            .data(schoolService.getAllSchools(name, province, district, street, email, phone, pageable))
            .build();
    }

    @GetMapping("/by-user/{userId}")
    public ApiResponse<Page<SchoolVO>> getSchoolsByUserId(
        @PathVariable Integer userId,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String name) {
        log.info("=========== school controller: getSchoolsByUserId ===============");
        Pageable pageable = PageRequest.of(page - 1, size);
        return ApiResponse.<Page<SchoolVO>>builder()
            .code(HttpStatus.OK.value())
            .message("Get schools by user ID successfully.")
            .data(schoolService.getSchoolsByUserId(userId, pageable, name))
            .build();
    }
    @GetMapping("/check-email/{email}")
    public ApiResponse<String> checkEmail(@PathVariable String email) {
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Email checked!")
                .data(String.valueOf(schoolService.checkEmailExists(email)))
                .build();
    }
    @GetMapping("/check-phone/{phone}")
    public ApiResponse<String> checkPhone(@PathVariable String phone) {
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Email checked!")
                .data(String.valueOf(schoolService.checkPhoneExists(phone)))
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

    @PutMapping("/change-status/{schoolId}")
    public ApiResponse<?> updateSchoolStatus(@PathVariable Integer schoolId, @Valid @RequestBody ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        schoolService.updateSchoolStatus(schoolId, changeSchoolStatusDTO);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update school status successfully.")
                .build();
    }


}
