package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ChangePasswordDTO;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.model.dto.SchoolOwnerDTO;
import fa.pjb.back.service.impl.ParentServiceImpl;
import fa.pjb.back.service.impl.SchoolOwnerServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("admin")
@Slf4j
public class AdminController {
    @Autowired
    private ParentServiceImpl parentService;
    @Autowired
    private  SchoolOwnerServiceImpl schoolOwnerService;

    @PostMapping("/parents")
    public ApiResponse<ParentDTO> createParent(@RequestBody ParentDTO parentDTO) {
        ParentDTO createdParent = parentService.createParent(parentDTO);
        log.info("Received ParentDTO: {}", parentDTO);
        return ApiResponse.<ParentDTO>builder()
                .code(200)
                .message("Parent created successfully")
                .data(createdParent)
                .build();
    }

    @PutMapping("/parents/{parentId}")
    public ApiResponse<ParentDTO> updateParent(@PathVariable Integer parentId, @RequestBody ParentDTO parentDTO) {
        ParentDTO updatedParent = parentService.editParent(parentId, parentDTO);
        return ApiResponse.<ParentDTO>builder()
                .code(200)
                .message("Parent updated successfully")
                .data(updatedParent)
                .build();
    }

    // API lấy thông tin Parent theo ID
    @GetMapping("/parents/{parentId}")
    public ApiResponse<ParentDTO> getParentById(@PathVariable Integer parentId) {
        ParentDTO parent = parentService.getParentById(parentId);
        return ApiResponse.<ParentDTO>builder()
                .code(200)
                .message("Parent retrieved successfully")
                .data(parent)
                .build();
    }

    // API đổi mật khẩu Parent
    @PutMapping("/parents/{parentId}/change-password")
    public ApiResponse<Void> changePassword(@PathVariable Integer parentId, @RequestBody ChangePasswordDTO request) {
        parentService.changePassword(parentId, request.getNewPassword());
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Password changed successfully")
                .build();
    }

    //APT tao SO
    @PostMapping("/school-owners/create")
    public ApiResponse<SchoolOwnerDTO> createSchoolOwner(@RequestBody SchoolOwnerDTO dto) {
        SchoolOwnerDTO response = schoolOwnerService.createSchoolOwner(dto);
        return ApiResponse.<SchoolOwnerDTO>builder()
                .code(200)
                .message("Parent created successfully")
                .data(response)
                .build();
    }
}
