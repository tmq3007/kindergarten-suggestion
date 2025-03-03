package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.vo.SchoolVO;
import fa.pjb.back.service.SchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("school")
public class SchoolController {
    private final SchoolService schoolService;

    @GetMapping("/{schoolId}")
    public ApiResponse<SchoolVO> getSchoolInfo(@PathVariable Integer schoolId) {
        log.info("=========== school controller ===============");
        return ApiResponse.<SchoolVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get school information successfully.")
                .data(schoolService.getSchoolInfo(schoolId))
                .build();
    }
}
