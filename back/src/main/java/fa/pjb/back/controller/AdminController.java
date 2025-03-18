package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.UserCreateDTO;
import fa.pjb.back.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("admin")
@Slf4j
public class AdminController {

    private final UserService userService;

    @PostMapping(value = "/user",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserCreateDTO> createUser(
            @RequestPart(value = "data") @Valid UserCreateDTO userCreateDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        UserCreateDTO createdUser = userService.createUser(userCreateDTO,images);
        log.info("Received UserDTO: {}", userCreateDTO);
        return ApiResponse.<UserCreateDTO>builder()
                .code(200)
                .message("User created successfully")
                .data(createdUser)
                .build();
    }

}
