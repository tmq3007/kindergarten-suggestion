package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
 import fa.pjb.back.model.dto.SchoolUpdateDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.ExpectedSchoolVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.SchoolListVO;
import fa.pjb.back.model.vo.SchoolOwnerVO;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("school")
public class SchoolController {
    private final SchoolService schoolService;
    private final GGDriveImageService imageService;
    private final RestClient.Builder builder;

    @GetMapping("/{schoolId}")
    public ApiResponse<SchoolDetailVO> getSchoolInfo(@PathVariable Integer schoolId) {
        return ApiResponse.<SchoolDetailVO>builder()
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
        Pageable pageable = PageRequest.of(page - 1, size);
        return ApiResponse.<Page<SchoolListVO>>builder()
            .code(HttpStatus.OK.value())
            .message("Get all schools successfully.")
            .data(schoolService.getAllSchools(name, province, district, street, email, phone, pageable))
            .build();
    }

    @GetMapping("/by-user")
    public ApiResponse<SchoolDetailVO> getSchoolByUserId(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false) String name) {
        // Lấy userId trực tiếp từ User entity
        Integer userId = user.getId();
        return ApiResponse.<SchoolDetailVO>builder()
            .code(HttpStatus.OK.value())
            .message("Get school by user ID successfully.")
            .data(schoolService.getSchoolByUserId(userId, name))
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
    public ApiResponse<SchoolDetailVO> addSchool(
            @RequestPart(value = "data") @Valid AddSchoolDTO schoolDTO,
            @RequestPart(value = "image", required = false) List<MultipartFile> images) throws IOException {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.CREATED.value())
                .message("School Created!")
                .data(schoolService.addSchool(schoolDTO,images))
                .build();
    }

    @PostMapping(value = "/update/by-admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SchoolDetailVO> updateSchoolByAdmin(
            @RequestPart(value = "data") @Valid SchoolUpdateDTO schoolDTO,
            @RequestPart(value = "image", required = false) List<MultipartFile> images) throws IOException {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("School updated successfully")
                .data(schoolService.updateSchoolByAdmin(schoolDTO, images))
                .build();
    }

    @PutMapping("/change-status/by-admin/{schoolId}")
    public ApiResponse<?> updateSchoolStatusByAdmin(@PathVariable Integer schoolId, @Valid @RequestBody ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        schoolService.updateSchoolStatusByAdmin(schoolId, changeSchoolStatusDTO);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update school status successfully.")
                .build();
    }

    @PutMapping("/change-status/by-school-owner/{schoolId}")
    public ApiResponse<?> updateSchoolStatusBySchoolOwner(@PathVariable Integer schoolId, @Valid @RequestBody ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        schoolService.updateSchoolStatusBySchoolOwner(schoolId, changeSchoolStatusDTO);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update school status successfully.")
                .build();
    }

    @GetMapping("/get-so-list")
    public ApiResponse<List<SchoolOwnerVO>> searchSchoolOwnersForAddSchool(@RequestParam("q") String expectedSchool) {
        return ApiResponse.<List<SchoolOwnerVO>>builder()
                .code(200)
                .message("Success")
                .data(schoolService.findSchoolOwnerForAddSchool(expectedSchool))
                .build();
    }

    @GetMapping("/search-expected-school/{id}")
    public ApiResponse<List<ExpectedSchoolVO>> searchExpectedSchoolForAddSchool(@PathVariable Integer id) {
        return ApiResponse.<List<ExpectedSchoolVO>>builder()
                .code(200)
                .message("Success")
                .data(schoolService.findAllDistinctExpectedSchoolsByRole(id))
                .build();
    }
}
