package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private AuthService authService;


    @GetMapping()
    public ApiResponse<Page<UserVO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<UserVO> users = userService.getAllUsers(PageRequest.of(page, size));
        return ApiResponse.<Page<UserVO>>builder()
                .code(HttpStatus.OK.value())
                .message("OK")
                .data(users)
                .build();
    }

    @Operation(summary = "Register", description = "Register")
    @PostMapping("register")
    public ApiResponse<User> register(@Valid @RequestBody RegisterDTO registerDTO, HttpServletResponse response) {
        return ApiResponse.<User>builder()
                .code(HttpStatus.OK.value())
                .message("Register successfully!")
                .data(userService.saveNewUser(registerDTO))
                .build();
    }

    @GetMapping("/check-email")
    public ApiResponse<String> checkEmail(@RequestParam String email) {
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Email available!")
                .data(String.valueOf(authService.checkEmailExists(email)))
                .build();
    }
}
