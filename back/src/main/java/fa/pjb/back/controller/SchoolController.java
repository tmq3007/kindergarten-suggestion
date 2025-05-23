package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.dto.ReviewDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.dto.SchoolSearchDTO;
import fa.pjb.back.model.vo.*;
import fa.pjb.back.service.SchoolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("school")
@Tag(name = "School Controller", description = "This API provides user the capability to CRUD school")
public class SchoolController {

    private final SchoolService schoolService;
    @Operation(summary = "Get school details for public", description = "Get school details by school id for public website")
    @GetMapping("/public/{schoolId}")
    public ApiResponse<SchoolDetailVO> getPublicSchoolInfoById(@PathVariable Integer schoolId) {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get school information successfully.")
                .data(schoolService.getPublicSchoolInfo(schoolId))
                .build();
    }



    @Operation(summary = "Get school info", description = "Get school information by school id")
    @GetMapping("/{schoolId}")
    public ApiResponse<SchoolDetailVO> getSchoolInfoById(@PathVariable Integer schoolId) {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get school information successfully.")
                .data(schoolService.getSchoolInfo(schoolId))
                .build();
    }

    @Operation(summary = "List all schools", description = "List all schools and information about that school for Admin")
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

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("postedDate").descending());
        return ApiResponse.<Page<SchoolListVO>>builder()
            .code(HttpStatus.OK.value())
            .message("Get all schools successfully.")
            .data(schoolService.getAllSchools(name, province, district, street, email, phone, pageable))
            .build();
    }

    @Operation(summary = "Check email", description = "Check email exists or not")
    @GetMapping("/check-email/{email}")
    public ApiResponse<Boolean> checkEmail(@PathVariable String email) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Email checked!")
                .data(schoolService.checkEmailExists(email))
                .build();
    }
    @Operation(summary = "Check email when edit", description = "Check email exists or not")
    @PostMapping("/check-editing-email")
    public ApiResponse<Boolean> checkEmailEdit(
            @RequestParam @NotBlank(message = "Email is not blank") @Email(message = "Email is not valid") String email,
            @RequestParam @NotNull(message = "School ID is not null") Integer schoolId
    ) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Email checked!")
                .data(schoolService.checkEditingEmailExists(email, schoolId))
                .build();
    }

    @Operation(summary = "Add school", description = "This API will add a new school")
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

    @Operation(summary = "Update school by admin", description = "Admin can update school information directly")
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

    @Operation(summary = "Update school by school owner", description = "School owner can update school information by creating draft with SUBMITTED status")
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

    @Operation(summary = "Save school by school owner", description = "School owner can save updated school information by creating draft with SAVED status")
    @PostMapping(value = "/save/by-so", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SchoolDetailVO> saveSchoolBySchoolOwner(
            @RequestPart(value = "data") @Valid SchoolDTO schoolDTO,
            @RequestPart(value = "image", required = false) List<MultipartFile> images) {
        log.info("FACILITIES: {}", schoolDTO.facilities());
        log.info("UTILITIES: {}", schoolDTO.utilities());
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("School updated successfully")
                .data(schoolService.saveSchoolBySchoolOwner(schoolDTO, images))
                .build();
    }

    @Operation(summary = "Update school status", description = "Update school status by admin")
    @PutMapping("/change-status/by-admin")
    public ApiResponse<?> updateSchoolStatusByAdmin(@Valid @RequestBody ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        schoolService.updateSchoolStatusByAdmin(changeSchoolStatusDTO);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update school status successfully.")
                .build();
    }

    @Operation(summary = "Update school status", description = "Update school status by school owner")
    @PutMapping("/change-status/by-school-owner")
    public ApiResponse<?> updateSchoolStatusBySchoolOwner(@Valid @RequestBody ChangeSchoolStatusDTO changeSchoolStatusDTO) {

        schoolService.updateSchoolStatusBySchoolOwner(changeSchoolStatusDTO);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update school status successfully.")
                .build();
    }

    @Operation(summary = "Get school owner list for add school", description = "Get school owner list for specified expected school")
    @GetMapping("/get-so-list")
    public ApiResponse<List<SchoolOwnerVO>> searchSchoolOwnersForAddSchool(@RequestParam("q") String expectedSchool,@RequestParam("BRN") String BRN) {
        return ApiResponse.<List<SchoolOwnerVO>>builder()
                .code(200)
                .message("Success")
                .data(schoolService.findSchoolOwnerForAddSchool(expectedSchool,BRN))
                .build();
    }

    @Operation(summary = "Search expected school", description = "Search the specified expected school names for creating school")
    @GetMapping("/search-expected-school/{id}")
    public ApiResponse<List<ExpectedSchoolVO>> searchExpectedSchoolForAddSchool(@PathVariable Integer id) {
        return ApiResponse.<List<ExpectedSchoolVO>>builder()
                .code(200)
                .message("Success")
                .data(schoolService.findAllDistinctExpectedSchoolsByRole(id))
                .build();
    }

    @Operation(summary = "Merge draft", description = "Admin approve updated school information by merging draft")
    @PutMapping("/merger-draft/{schoolId}")
    public ApiResponse<Boolean> mergeDraft(@PathVariable Integer schoolId) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Merge draft successfully.")
                .data(schoolService.mergeDraft(schoolId))
                .build();
    }

    @Operation(summary = "Is Draft", description = "Check record is draft or not")
    @GetMapping("/isDraft/{schoolId}")
    public ApiResponse<Boolean> isDraft(@PathVariable Integer schoolId) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Check draft successfully.")
                .data(schoolService.isDraft(schoolId))
                .build();
    }

    @Operation(summary = "Get all draft-related schools", description = "Retrieve all original schools that have drafts referencing them")
    @GetMapping("/all-drafts")
    public ApiResponse<Page<SchoolListVO>> getAllDrafts(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String phone) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("postedDate").descending());
        return ApiResponse.<Page<SchoolListVO>>builder()
            .code(HttpStatus.OK.value())
            .message("Get all draft-related schools successfully.")
            .data(schoolService.getAllDrafts(name, district, email, phone, pageable))
            .build();
    }

    @Operation(summary = "Search schools by criteria", description = "This api allow user to filter school with criteria")
    @GetMapping("/search-by-criteria")
    public ApiResponse<Page<SchoolSearchNativeVO>> searchSchools(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Byte type,
            @RequestParam(required = false) Byte age,
            @RequestParam(required = false) Long minFee,
            @RequestParam(required = false) Long maxFee,
            @RequestParam(required = false) List<Integer> facilityIds,
            @RequestParam(required = false) List<Integer> utilityIds,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {

        SchoolSearchDTO searchDTO = SchoolSearchDTO.builder()
                .name(name)
                .type(type)
                .age(age)
                .minFee(minFee)
                .maxFee(maxFee)
                .facilityIds(facilityIds)
                .utilityIds(utilityIds)
                .province(province)
                .district(district)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        return ApiResponse.<Page<SchoolSearchNativeVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get search results successfully.")
                .data(schoolService.searchSchoolByCriteriaWithNative(searchDTO))
                .build();
    }

    @Operation(summary = "List active schools without reference",
        description = "List all active schools (status = 1) without reference ID, filtered by location and other criteria")
    @GetMapping("/active-no-ref")
    public ApiResponse<Page<SchoolListVO>> getActiveSchoolsWithoutRefId(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String phone) {

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("postedDate").descending());
        return ApiResponse.<Page<SchoolListVO>>builder()
            .code(HttpStatus.OK.value())
            .message("Get active schools without reference ID successfully.")
            .data(schoolService.getActiveSchoolsWithoutRefId(name, district, email, phone, pageable))
            .build();
    }

    @Operation(summary = "Count active schools without ref_id", description = "Count the number of active schools with no reference ID")
    @GetMapping("/count/active-no-ref")
    public ApiResponse<Long> countActiveSchoolsWithoutRefId() {
        return ApiResponse.<Long>builder()
            .code(HttpStatus.OK.value())
            .message("Count active schools without ref_id successfully.")
            .data(schoolService.countActiveSchoolsWithoutRefId())
            .build();
    }

    @Operation(summary = "Count submitted draft schools", description = "Count the number of draft schools with status Submitted")
    @GetMapping("/count/drafts")
    public ApiResponse<Long> countAllDrafts() {
        return ApiResponse.<Long>builder()
            .code(HttpStatus.OK.value())
            .message("Count submitted draft schools successfully.")
            .data(schoolService.countAllDrafts())
            .build();
    }

}
