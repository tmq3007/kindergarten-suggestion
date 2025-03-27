package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.service.SchoolService;
import io.swagger.v3.oas.annotations.Operation;
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

    @Operation(summary = "Get school info", description = "Get information of school owner's school")
    @GetMapping("/school-info")
    public ApiResponse<SchoolDetailVO> getSchoolInfo(
            @AuthenticationPrincipal User user) {
        Integer userId = user.getId();
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get school info successfully.")
                .data(schoolService.getSchoolByUserId(userId))
                .build();
    }

    @Operation(summary = "Get School Draft Info", description = "Get School Draft Information for School Owner")
    @GetMapping("/draft")
    public ApiResponse<SchoolDetailVO> getSchoolDraftInfo(
            @AuthenticationPrincipal User user
    ) {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get school information successfully.")
                .data(schoolService.getDraft(user))
                .build();
    }

    @Operation(summary = "Get draft info", description = "Get draft information of school owner's school")
    @GetMapping("/draft-info")
    public ApiResponse<SchoolDetailVO> getDraftInfo(
            @AuthenticationPrincipal User user) {
        return ApiResponse.<SchoolDetailVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get draft info successfully.")
                .data(schoolService.getDraft(user))
                .build();
    }

}
