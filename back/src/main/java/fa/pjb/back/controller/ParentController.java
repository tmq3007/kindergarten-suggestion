package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ChangePasswordDTO;
import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.service.ParentService;
import io.swagger.v3.oas.annotations.Operation;
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

@RequiredArgsConstructor
@RestController
@RequestMapping("parent")
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

    @Operation(summary = "Get All Parents" , description = "This api will be used to retrieve all parents")
    @GetMapping("/get-all-parents")
    public ApiResponse<Page<ParentVO>> getAllParents(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Invalid page number") int page,
            @RequestParam(defaultValue = "15") @Max(value = 100, message = "Page size exceeds the maximum limit") int size,
            @RequestParam(required = false) String searchBy,
            @RequestParam(required = false) String keyword
    ) {
        Page<ParentVO> parents = parentService.getAllParent(page, size, searchBy, keyword);
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
            @RequestParam(required = false) String keyword,
            @AuthenticationPrincipal User user
    ) {
        Page<ParentVO> parents = parentService.getParentBySchool(user, page, size, searchBy, keyword);
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
            @RequestParam(required = false) String searchBy,
            @RequestParam(required = false) String keyword,
            @AuthenticationPrincipal User user
    ) {
        Page<ParentVO> parents = parentService.getEnrollRequestBySchool(user, page, size, searchBy, keyword);
        return ApiResponse.<Page<ParentVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Parents retrieved successfully")
                .data(parents)
                .build();
    }

    @Operation(summary = "Enroll Parent", description = "This api will be used to enroll a parent into a school")
    @PostMapping("/enroll/{userId}")
    public ApiResponse<Boolean> enrollParent(@PathVariable Integer userId) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Parent enrolled successfully")
                .data(parentService.enrollParent(userId))
                .build();
    }

}
