package fa.pjb.back.controller;

import fa.pjb.back.model.dto.CreateUserDTO;
import fa.pjb.back.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("user")
public class UserController {
    private final UserService userService;

    // API tìm kiếm người dùng theo ID
    @GetMapping("/{id}")
    public String getUser(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public String createUser(@Valid @RequestBody CreateUserDTO createUserDTO) {
        return "User created: " + createUserDTO.getUsername();
    }
}
