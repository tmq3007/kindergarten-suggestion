package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.UserDTO;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.ParentServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("admin")
@Slf4j
public class AdminController {

    private final UserService userService;

    @PostMapping("/user")
    public ApiResponse<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.createUser(userDTO);
        log.info("Received UserDTO: {}", userDTO);
        return ApiResponse.<UserDTO>builder()
                .code(200)
                .message("User created successfully")
                .data(createdUser)
                .build();
    }

}
