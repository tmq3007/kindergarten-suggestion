package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.model.dto.UserDetailDTO;
import fa.pjb.back.model.dto.UserUpdateDTO;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("user")
@Tag(name = "User Controller", description = "This API provides some actions relate with User action")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @Operation(summary = "Get user list", description = "Get user list for admin")
    @GetMapping()
    public ApiResponse<Page<UserVO>> getUsers(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Invalid page number") int page,
            @RequestParam(defaultValue = "15") @Max(value = 100, message = "Page size exceeds the maximum limit") int size,
            @RequestParam(required = false, defaultValue = "username") String searchBy,
            @RequestParam(required = false) String keyword
    ) {
        Page<UserVO> users = userService.getAllUsersAdmin(page, size, searchBy, keyword);
        return ApiResponse.<Page<UserVO>>builder()
                .code(HttpStatus.OK.value())
                .message("Users retrieved successfully")
                .data(users)
                .build();
    }

    @Operation(summary = "User Detail", description = "Print out all information of user")
    @GetMapping("/detail")
    public ApiResponse<UserDetailDTO> getUserDetail(@RequestParam int userId) {
        UserDetailDTO userDetail = userService.getUserDetailById(userId);
        return ApiResponse.<UserDetailDTO>builder()
                .code(HttpStatus.OK.value())
                .message("User detail retrieved successfully")
                .data(userDetail)
                .build();
    }

    @Operation(summary = "Update User", description = "Update user details, including optional images for SchoolOwner")
    @PostMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserDetailDTO> updateUser(
        @RequestPart("data") @Valid UserUpdateDTO userUpdateDTO,
        @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            UserDetailDTO updatedUser = userService.updateUser(userUpdateDTO, images);
            return ApiResponse.<UserDetailDTO>builder()
                    .code(HttpStatus.OK.value())
                    .message("User updated successfully")
                    .data(updatedUser)
                    .build();
        } catch (IllegalArgumentException e) {
            return ApiResponse.<UserDetailDTO>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .build();
        }
    }

    @Operation(summary = "Change Status", description = "Change status of user (Switch between Active and Inactive)")
    @PutMapping("/toggle")
    public ApiResponse<UserDetailDTO> toggleUserStatus(@RequestParam int userId) {
        UserDetailDTO updatedUser = userService.toggleStatus(userId);
        return ApiResponse.<UserDetailDTO>builder()
                .code(HttpStatus.OK.value())
                .message("User status toggled successfully")
                .data(updatedUser)
                .build();
    }

    @Operation(summary = "Create User", description = "Create school owner and admin")
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserCreateDTO> createUser(
            @RequestPart(value = "data") @Valid UserCreateDTO userCreateDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        UserCreateDTO createdUser = userService.createUser(userCreateDTO, images);
        log.info("Received UserDTO: {}", userCreateDTO);
        return ApiResponse.<UserCreateDTO>builder()
                .code(200)
                .message("User created successfully")
                .data(createdUser)
                .build();
    }

    @GetMapping("/check-phone-exist")
    public ApiResponse<Boolean> checkPhoneExist(@RequestParam String phone) {
        return ApiResponse.<Boolean>builder()
                .code(200)
                .message("Check phone exist successfully!")
                .data(userService.checkPhoneExist(phone)).build();
    }

    @GetMapping("/check-phone-exist-except")
    public ApiResponse<Boolean> checkPhoneExistExcept(@RequestParam String phone, @RequestParam Integer userId) {
        log.info("phone: {}, userId: {}", phone, userId);
        return ApiResponse.<Boolean>builder()
                .code(200)
                .message("Check phone exist successfully!")
                .data(userService.checkPhoneExistExcept(phone, userId)).build();
    }

    @GetMapping("/check-email-exist-except")
    public ApiResponse<Boolean> checkEmailExistExcept(@RequestParam String email, @RequestParam Integer userId) {
        log.info("email: {}, userId: {}", email, userId);
        return ApiResponse.<Boolean>builder()
                .code(200)
                .message("Check email exist successfully!")
                .data(userService.checkEmailExistExcept(email, userId)).build();
    }

    @GetMapping("/check-email-exist")
    public ApiResponse<Boolean> checkEmailExist(@RequestParam String email) {
        return ApiResponse.<Boolean>builder()
                .code(200)
                .message("Check email exist successfully!")
                .data(userService.checkEmailExist(email)).build();
    }

}
