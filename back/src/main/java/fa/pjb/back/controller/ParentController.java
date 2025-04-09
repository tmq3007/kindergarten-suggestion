package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ChangePasswordDTO;
import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.*;
import fa.pjb.back.service.ParentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("parent")
@Tag(name = "Parent Controller", description = "This API provides action relate to Parent Action")

public class ParentController {

    private final ParentService parentService;

    @Operation(summary = "Register", description = "This api will be used to register new parent")
    @PostMapping("register")
    public ApiResponse<RegisterVO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        RegisterVO registerVO = parentService.saveNewParent(registerDTO);
        return ApiResponse.<RegisterVO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Parent registered successfully")
                .data(registerVO)
                .build();
    }


    @PreAuthorize("hasRole('ROLE_PARENT')") // Just parent can change pwd
    @PutMapping("/{parentId}/change-password")
    public ApiResponse<Void> changePassword(@PathVariable Integer parentId, @RequestBody ChangePasswordDTO request) {
        parentService.changePassword(parentId, request.oldPassword(), request.newPassword());
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Password changed successfully")
                .build();
    }

    @Operation(summary = "Edit Parent Information", description = "Edit Parent Information By Id")
    @PutMapping(value = "/edit/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ParentVO> editParent(
            @PathVariable Integer userId,
            @RequestPart(value = "data") @Valid ParentUpdateDTO parentUpdateDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        ParentVO updatedParent = parentService.editParent(userId, parentUpdateDTO, image);
        return ApiResponse.<ParentVO>builder()
                .code(HttpStatus.OK.value())
                .message("Parent updated successfully")
                .data(updatedParent)
                .build();
    }

    @Operation(summary = "Change Avatar", description = "Change Avatar Of Parent By Id")
    @PutMapping("/change-avatar/{userId}")
    public ApiResponse<MediaVO> changeAvatar(@PathVariable Integer userId, @RequestParam MultipartFile image) {
        MediaVO updatedParent = parentService.changeAvatar(userId, image);
        return ApiResponse.<MediaVO>builder()
                .code(HttpStatus.OK.value())
                .message("Avatar changed successfully")
                .data(updatedParent)
                .build();
    }

    @Operation(summary = "Get Parent Details", description = "Get Parent Details By Id")
    @GetMapping("/{userId}")
    public ApiResponse<ParentVO> getParentById(@PathVariable Integer userId) {
        ParentVO parent = parentService.getParentById(userId);
        return ApiResponse.<ParentVO>builder()
                .code(HttpStatus.OK.value())
                .message("Parent details retrieved successfully")
                .data(parent)
                .build();
    }

    @Operation(summary = "Get All Parents", description = "This api will be used to retrieve all parents")
    @GetMapping("/get-all-parents")
    public ApiResponse<Page<ParentVO>> getAllParents(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Invalid page number") int page,
            @RequestParam(defaultValue = "15") @Max(value = 100, message = "Page size exceeds the maximum limit") int size,
            @RequestParam(required = false, defaultValue = "username") String searchBy,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean status
    ) {
        Page<ParentVO> parents = parentService.getAllParent(page, size, searchBy, keyword, status);
        return ApiResponse.<Page<ParentVO>>builder()
                .code(HttpStatus.OK.value())
                .message("All parents retrieved successfully")
                .data(parents)
                .build();
    }

    @Operation(summary = "Get All Parents By School", description = "This api will be used to retrieve all enrolled parents by school")
    @GetMapping("/get-parent-by-school")
    public ApiResponse<Page<ParentVO>> getParentsBySchool(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Invalid page number") int page,
            @RequestParam(defaultValue = "15") @Max(value = 100, message = "Page size exceeds the maximum limit") int size,
            @RequestParam(required = false) String searchBy,
            @RequestParam(required = false) String keyword
    ) {
        Page<ParentVO> parents = parentService.getParentBySchool(page, size, searchBy, keyword);
        return ApiResponse.<Page<ParentVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Parents retrieved successfully")
                .data(parents)
                .build();
    }

    @Operation(summary = "Get All Enroll Request By School", description = "This api will be used to retrieve all enroll request of parents by school")
    @GetMapping("/get-enroll-request-by-school")
    public ApiResponse<Page<ParentVO>> getEnrollRequestBySchool(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Invalid page number") int page,
            @RequestParam(defaultValue = "15") @Max(value = 100, message = "Page size exceeds the maximum limit") int size,
            @RequestParam(required = false, defaultValue = "username") String searchBy,
            @RequestParam(required = false) String keyword
    ) {
        Page<ParentVO> parents = parentService.getEnrollRequestBySchool(page, size, searchBy, keyword);
        return ApiResponse.<Page<ParentVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Parents retrieved successfully")
                .data(parents)
                .build();
    }

    @Operation(summary = "Get Academic History", description = "This api used to get academic history of parent by their ID")
    @GetMapping("/get-academic-history/{parentId}")
    public ApiResponse<List<ParentInSchoolVO>> getAcademicHistory(@PathVariable Integer parentId) {
        List<ParentInSchoolVO> academicHistory = parentService.getAcademicHistory(parentId);
        return ApiResponse.<List<ParentInSchoolVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Academic history retrieved successfully")
                .data(academicHistory)
                .build();
    }

    @Operation(summary = "Enroll Parent", description = "This api will be used to enroll a parent into a school")
    @PutMapping("/enroll/{parentInSchoolId}")
    public ApiResponse<Boolean> enrollParent(@PathVariable Integer parentInSchoolId) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Parent enrolled successfully")
                .data(parentService.enrollParent(parentInSchoolId))
                .build();
    }

    @Operation(summary = "Un-Enroll Parent", description = "This api will be used to un-enroll a parent from a school")
    @PutMapping("/un-enroll/{parentInSchoolId}")
    public ApiResponse<Boolean> unEnrollParent(@PathVariable Integer parentInSchoolId) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Parent un-enrolled successfully")
                .data(parentService.unEnrollParent(parentInSchoolId))
                .build();
    }

    @Operation(summary = "Reject Parent", description = "This api will be used to reject a parent from enrolling a school")
    @PutMapping("/reject/{parentInSchoolId}")
    public ApiResponse<Boolean> rejectParent(@PathVariable Integer parentInSchoolId) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Parent rejected successfully")
                .data(parentService.rejectParent(parentInSchoolId))
                .build();
    }

    @Operation(summary = "Get enroll request count", description = "Get pending enroll request count for school owners")
    @GetMapping("/get-school-request-count")
    public ApiResponse<Integer> getSchoolRequestCount() {
        return ApiResponse.<Integer>builder()
                .code(HttpStatus.OK.value())
                .message("School request count retrieved successfully")
                .data(parentService.getSchoolRequestCount())
                .build();
    }

    @Operation(summary = "Get Present Academic History", description = "This api used to get present academic history of parent by their ID")
    @GetMapping("/get-present-academic-history")
    public ApiResponse<Page<ParentInSchoolDetailVO>> getPresentAcademicHistory(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Invalid page number") int page,
            @RequestParam(defaultValue = "2") @Max(value = 100, message = "Page size exceeds the maximum limit") int size) {
        Page<ParentInSchoolDetailVO> academicHistory = parentService.getPresentAcademicHistory(page, size);
        return ApiResponse.<Page<ParentInSchoolDetailVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Present academic history retrieved successfully")
                .data(academicHistory)
                .build();
    }

    @Operation(summary = "Get Previous Academic History", description = "This api used to get previous academic history of parent by their ID")
    @GetMapping("/get-previous-academic-history")
    public ApiResponse<Page<ParentInSchoolDetailVO>> getPreviousAcademicHistory(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Invalid page number") int page,
            @RequestParam(defaultValue = "2") @Max(value = 100, message = "Page size exceeds the maximum limit") int size) {
        Page<ParentInSchoolDetailVO> academicHistory = parentService.getPreviousAcademicHistory(page, size);
        return ApiResponse.<Page<ParentInSchoolDetailVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Previous academic history retrieved successfully")
                .data(academicHistory)
                .build();
    }

}
