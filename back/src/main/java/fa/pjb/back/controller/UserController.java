package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.vo.UserVO;
import fa.pjb.back.repository.ParentRepository;
 import fa.pjb.back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("admin")
public class UserController {

    @Autowired
    private UserService userService;


    @GetMapping("user")
    public ApiResponse<Page<UserVO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<UserVO> users = userService.getAllUsers(PageRequest.of(page, size));
        return ApiResponse.<Page<UserVO>>builder()
                .code(200)
                .message("OK")
                .data(users)
                .build();
    }
}
