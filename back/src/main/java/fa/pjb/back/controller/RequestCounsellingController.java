package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.dto.RequestCounsellingUpdateDTO;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.service.RequestCounsellingReminderService;
import fa.pjb.back.service.RequestCounsellingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@RestController
@RequestMapping("counselling")
@Tag(name = "Request Counselling Controller", description = "This API provides some actions relate with request counselling")
public class RequestCounsellingController {

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
                .code(HttpStatus.OK.value())
                .message("Counseling request created successfully!")
                .data(createdRequest)
                .build();
    }

    @Operation(summary = "List All Request Counselling", description = "Admin can see all request counselling that parents requested for all School Owner")
    @GetMapping("/all")
    public ApiResponse<Page<RequestCounsellingVO>> getAllRequests(
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
        return ApiResponse.<Page<RequestCounsellingVO>>builder()
            .code(HttpStatus.OK.value())
            .message("All parents retrieved successfully")
            .data(requests)
            .build();
    }

    @Operation(summary = "Get request counselling", description = "Get detailed request counselling")
    @GetMapping("/{requestCounsellingId}")
    public ApiResponse<RequestCounsellingVO> getRequestCounselling(@PathVariable Integer requestCounsellingId) {
        return ApiResponse.<RequestCounsellingVO>builder()
                .code(HttpStatus.OK.value())
                .message("Get request counselling successfully!")
                .data(requestCounsellingService.getRequestCounselling(requestCounsellingId))
                .build();
    }

    @Operation(summary = "Update request counselling", description = "Update request counselling result")
    @PutMapping("/update-request-counselling")
    public ApiResponse<Void> updateRequestCounselling(@Valid @RequestBody RequestCounsellingUpdateDTO request) {
        requestCounsellingService.updateRequestCounselling(request);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Update request counselling successfully!")
                .build();
    }

    @Operation(summary = "List All Reminder", description = "List all reminder requests that are waiting School Owner solve or expired, with optional name search")
    @GetMapping("/all-reminder")
    public ApiResponse<Page<RequestCounsellingVO>> getAllReminder(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "") String name) {

        Page<RequestCounsellingVO> requests = reminderService.getAllReminder(
            page, size, Arrays.asList((byte) 0, (byte) 2), name.trim()
        );

        return ApiResponse.<Page<RequestCounsellingVO>>builder()
            .code(HttpStatus.OK.value())
            .message("Fetched reminders successfully")
            .data(requests)
            .build();
    }

    @Operation(summary = "List Reminders by School Owner",
        description = "List all reminder requests for a specific school owner based on their ID")
    @GetMapping("/school-owner-reminders")
    public ApiResponse<Page<RequestCounsellingVO>> getRemindersBySchoolOwner(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestHeader("School-Owner-Id") Integer schoolOwnerId) {

        Page<RequestCounsellingVO> requests = reminderService.getRemindersBySchoolOwner(
            page, size, schoolOwnerId, Arrays.asList((byte) 0, (byte) 2)
        );

        return ApiResponse.<Page<RequestCounsellingVO>>builder()
            .code(HttpStatus.OK.value())
            .message("Fetched reminders for school owner successfully")
            .data(requests)
            .build();
    }


}
