package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.service.RequestCounsellingReminderService;
import fa.pjb.back.service.RequestCounsellingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("counselling")
public class RequestCounsellingController {
     private final RequestCounsellingReminderService reminderService;
    private final RequestCounsellingService requestCounsellingService;
    @GetMapping("/alert-reminder")
    public ApiResponse<RequestCounsellingReminderVO> checkOverdueForUser(@RequestParam("userId") Integer userId) {
        return ApiResponse.<RequestCounsellingReminderVO>builder()
                .code(HttpStatus.OK.value())
                .message("Reminder checked!")
                .data(reminderService.checkOverdueForSchoolOwner(userId))
                .build();
    }

    @PostMapping("/request")
    public ApiResponse<RequestCounsellingVO> createRequestCounselling(
            @Valid @RequestBody RequestCounsellingDTO request) {
        RequestCounsellingVO createdRequest = requestCounsellingService.createRequestCounselling(request);
        return ApiResponse.<RequestCounsellingVO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Counseling request created successfully!")
                .data(createdRequest)
                .build();
    }

    @GetMapping("/{requestCounsellingId}")
    public ApiResponse<RequestCounsellingVO> getRequestCounselling(@PathVariable Integer requestCounsellingId) {
        return ApiResponse.<RequestCounsellingVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get request counselling successfully!")
                .data(requestCounsellingService.getRequestCounselling(requestCounsellingId))
                .build();
    }
}
