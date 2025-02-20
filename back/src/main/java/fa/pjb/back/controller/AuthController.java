package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("auth")
@Tag(name = "Authentication",
        description = "This API provides user the capability to authentication")

public class AuthController {
    private final AuthService authService;

    @Operation(
            summary = "Login",
            description = "Login"
    )
    @PostMapping("login")
    public ApiResponse<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO, HttpServletResponse response) {
        return ApiResponse.<LoginVO>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .data(authService.login(loginDTO, response))
                .build();
    }
}
