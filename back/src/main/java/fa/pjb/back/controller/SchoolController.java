package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.vo.ExpectedSchoolVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.SchoolListVO;
import fa.pjb.back.model.vo.SchoolOwnerVO;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.service.SchoolService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping("/check-email/{email}")
    public ApiResponse<String> checkEmail(@PathVariable String email) {
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Email checked!")
                .data(String.valueOf(schoolService.checkEmailExists(email)))
                .build();
    }

    @PostMapping("/check-editing-email")
    public ApiResponse<String> checkEmailEdit(
            @RequestParam @NotBlank(message = "Email is not blank") @Email(message = "Email is not valid") String email,
            @RequestParam @NotNull(message = "School ID is not null") Integer schoolId
    ) {
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Email checked!")
                .data(String.valueOf(schoolService.checkEditingEmailExists(email, schoolId)))
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
            @RequestPart(value = "data") @Valid SchoolDTO schoolDTO,
            @RequestPart(value = "image", required = false) List<MultipartFile> images) {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.CREATED.value())
                .message("School Created!")
                .data(schoolService.addSchool(schoolDTO, images))
                .build();
    }

    @PostMapping(value = "/update/by-admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SchoolDetailVO> updateSchoolByAdmin(
            @RequestPart(value = "data") @Valid SchoolDTO schoolDTO,
            @RequestPart(value = "image", required = false) List<MultipartFile> images) {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("School updated successfully")
                .data(schoolService.updateSchoolByAdmin(schoolDTO, images))
                .build();
    }

    @PostMapping(value = "/update/by-so", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SchoolDetailVO> updateSchoolBySchoolOwner(
            @RequestPart(value = "data") @Valid SchoolDTO schoolDTO,
            @RequestPart(value = "image", required = false) List<MultipartFile> images) {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("School updated successfully")
                .data(schoolService.updateSchoolBySchoolOwner(schoolDTO, images))
                .build();
    }

    @PutMapping("/change-status/by-admin")
    public ApiResponse<?> updateSchoolStatusByAdmin(@Valid @RequestBody ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        schoolService.updateSchoolStatusByAdmin(changeSchoolStatusDTO);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update school status successfully.")
                .build();
    }

    @PutMapping("/change-status/by-school-owner")
    public ApiResponse<?> updateSchoolStatusBySchoolOwner(@Valid @RequestBody ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        schoolService.updateSchoolStatusBySchoolOwner(changeSchoolStatusDTO);

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
