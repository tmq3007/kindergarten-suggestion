package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ChangePasswordDTO;
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

    // API đổi mật khẩu Parent
    @PutMapping("/{parentId}/change-password")
    @PreAuthorize("hasRole('ROLE_PARENT')") // Chỉ parent mới được đổi mật khẩu
    public ApiResponse<Void> changePassword(@PathVariable Integer parentId, @RequestBody String newPassword) {
        parentService.changePassword(parentId,newPassword);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Password changed successfully")
                .build();
    }
}
