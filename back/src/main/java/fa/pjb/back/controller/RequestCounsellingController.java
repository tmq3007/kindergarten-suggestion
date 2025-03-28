package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.dto.RequestCounsellingUpdateDTO;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.service.RequestCounsellingReminderService;
import fa.pjb.back.service.RequestCounsellingService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@RestController
@RequestMapping("counselling")
public class RequestCounsellingController {

    private static final Logger logger = LoggerFactory.getLogger(RequestCounsellingController.class);
    private final RequestCounsellingReminderService reminderService;
    private final RequestCounsellingService requestCounsellingService;

    @Operation(summary = "Request Counselling Reminder", description = "Send email and notification to school owner and admin")
    @GetMapping("/alert-reminder")
    public ApiResponse<RequestCounsellingReminderVO> checkOverdueForUser(
            @RequestParam("userId") @Min(1) Integer userId) {
        return ApiResponse.<RequestCounsellingReminderVO>builder()
                .code(HttpStatus.OK.value())
                .message("Reminder checked!")
                .data(reminderService.checkOverdueForSchoolOwner(userId))
                .build();
    }


    @Operation(summary = "Request counselling", description = "Parents make request counselling to school owner")
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

    @GetMapping("/all")
    public ResponseEntity<Page<RequestCounsellingVO>> getAllRequests(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) Byte status,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String phone,
        @RequestParam(required = false) String schoolName,
        @RequestParam(required = false) LocalDateTime dueDate) {

        Page<RequestCounsellingVO> requests = requestCounsellingService.getAllRequests(
            page, size, status, email, name, phone, schoolName, dueDate
        );
        logger.info("Pageable response: {}", requests);
        return ResponseEntity.ok(requests);
    }

    @Operation(summary = "Get request counselling", description = "Get detailed request counselling by admin")
    @GetMapping("/get-by-admin/{requestCounsellingId}")
    public ApiResponse<RequestCounsellingVO> getRequestCounsellingByAdmin(@PathVariable Integer requestCounsellingId) {
        return ApiResponse.<RequestCounsellingVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get request counselling successfully!")
                .data(requestCounsellingService.getRequestCounsellingByAdmin(requestCounsellingId))
                .build();
    }

    @Operation(summary = "Get request counselling", description = "Get detailed request counselling by school owner")
    @GetMapping("/get-by-school-owner/{requestCounsellingId}")
    public ApiResponse<RequestCounsellingVO> getRequestCounsellingBySchoolOwner(@PathVariable Integer requestCounsellingId) {
        return ApiResponse.<RequestCounsellingVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get request counselling successfully!")
                .data(requestCounsellingService.getRequestCounsellingBySchoolOwner(requestCounsellingId))
                .build();
    }

    @Operation(summary = "Update request counselling", description = "Update request counselling result by admin")
    @PutMapping("/update-request-counselling-by-admin")
    public ApiResponse<Void> updateRequestCounselling(@Valid @RequestBody RequestCounsellingUpdateDTO request) {
        requestCounsellingService.updateRequestCounsellingByAdmin(request);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update request counselling successfully!")
                .build();
    }

    @Operation(summary = "Update request counselling", description = "Update request counselling result by school owner")
    @PutMapping("/update-request-counselling-by-school-owner")
    public ApiResponse<Void> updateRequestCounsellingBySchoolOwner(@Valid @RequestBody RequestCounsellingUpdateDTO request) {
        requestCounsellingService.updateRequestCounsellingBySchoolOwner(request);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update request counselling successfully!")
                .build();
    }
}
