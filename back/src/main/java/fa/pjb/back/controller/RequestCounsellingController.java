package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.service.RequestCounsellingReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
@RequiredArgsConstructor
@RestController
@RequestMapping("reminders")
public class RequestCounsellingController {
     private final RequestCounsellingReminderService reminderService;

    @GetMapping("/alert-reminder")
    public ApiResponse<RequestCounsellingReminderVO> checkOverdueForUser(@RequestParam("userId") Integer userId) {
        return ApiResponse.<RequestCounsellingReminderVO>builder()
                .code(HttpStatus.OK.value())
                .message("Reminder checked!")
                .data(reminderService.checkOverdueForSchoolOwner(userId))
                .build();
    }
}
