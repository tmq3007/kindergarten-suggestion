package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("user")
public class UserController {
    private final UserService userService;
    private final AuthService authService;


    @GetMapping()
    public ApiResponse<Page<UserVO>> getUsers(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Invalid page number") int page,
            @RequestParam(defaultValue = "10") @Max(value = 50, message = "Page size exceeds the maximum limit") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone
    ) {
        Page<UserVO> users = userService.getAllUsers(page, size, role, email, name, phone);
        return ApiResponse.<Page<UserVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Users retrieved successfully")
                .data(users)
                .build();
    }

    @GetMapping("/detail")
    public ApiResponse<UserDetailDTO> getUserDetail(@RequestParam int userId) {
        UserDetailDTO userDetail = userService.getUserDetailById(userId);
        return ApiResponse.<UserDetailDTO>builder()
                .code(HttpStatus.OK.value())
                .message("User detail retrieved successfully")
                .data(userDetail)
                .build();
    }

    @PostMapping("/update")
    public ApiResponse<UserDetailDTO> updateUser(
            @Valid @RequestBody UserUpdateDTO userUpdateDTO
    ) {
        UserDetailDTO updatedUser = userService.updateUser(userUpdateDTO);

        return ApiResponse.<UserDetailDTO>builder()
                .code(HttpStatus.OK.value())
                .message("User updated successfully")
                .data(updatedUser)
                .build();
    }

    @PutMapping("/toggle")
    public ApiResponse<UserDetailDTO> toggleUserStatus(@RequestParam int userId) {
        UserDetailDTO updatedUser = userService.toggleStatus(userId);
        return ApiResponse.<UserDetailDTO>builder()
                .code(HttpStatus.OK.value())
                .message("User status toggled successfully")
                .data(updatedUser)
                .build();
    }


}
