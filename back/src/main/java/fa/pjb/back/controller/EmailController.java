package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("email")
public class EmailController {
    private final EmailService emailService;

    @PostMapping("send-password-reset")
    public ApiResponse<String> sendPasswordResetEmail(@RequestParam String to, @RequestParam String resetLink) {
        return ApiResponse.<String>builder()
                .data(emailService.sendPasswordResetEmail(to, resetLink))
                .build();
    }

}
