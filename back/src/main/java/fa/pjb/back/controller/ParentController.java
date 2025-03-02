package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ChangePasswordDTO;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.service.ParentService;
import fa.pjb.back.service.impl.ParentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("parent")
public class ParentController {
    private final ParentService parentService;

    @Operation(summary = "Register", description = "Register")
    @PostMapping("register")
    public ApiResponse<RegisterVO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        RegisterVO registerVO = parentService.saveNewParent(registerDTO);
        return ApiResponse.<RegisterVO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Parent registered successfully")
                .data(registerVO)
                .build();
    }

    @PutMapping("/{parentId}/change-password")
    @PreAuthorize("hasRole('ROLE_PARENT')") // Just parent can change pwd
    public ApiResponse<Void> changePassword(@PathVariable Integer parentId, @RequestBody ChangePasswordDTO request) {
        parentService.changePassword(parentId, request.oldPassword(), request.newPassword());
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Password changed successfully")
                .build();
    }

    @PutMapping("/edit/{parentId}")
    public ApiResponse<ParentDTO> editParent(@PathVariable Integer parentId,
                                             @Valid
                                             @RequestBody ParentDTO parentDTO) {
        ParentDTO updatedParent = parentService.editParent(parentId, parentDTO);
        return ApiResponse.<ParentDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Parent updated successfully")
                .data(updatedParent)
                .build();
    }

    @GetMapping("/{parentId}")
    public ApiResponse<ParentDTO> getParentById(@PathVariable Integer parentId) {
        ParentDTO parent = parentService.getParentById(parentId);
        return ApiResponse.<ParentDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Parent details retrieved successfully")
                .data(parent)
                .build();
    }

}
