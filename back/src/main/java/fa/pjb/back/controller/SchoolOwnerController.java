package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.service.SchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("school-owner")
public class SchoolOwnerController {

    private final SchoolService schoolService;

    @GetMapping("/school-info")
    public ApiResponse<SchoolDetailVO> getSchoolByUserId(
            @AuthenticationPrincipal User user) {
        // Lấy userId trực tiếp từ User entity
        Integer userId = user.getId();
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get school by user ID successfully.")
                .data(schoolService.getSchoolByUserId(userId))
                .build();
    }
}
