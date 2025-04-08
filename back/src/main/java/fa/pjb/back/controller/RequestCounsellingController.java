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

    @Operation(summary = "List All Request Counselling",
        description = "Admin can see all request counselling that parents requested for all School Owners, with optional dynamic search")
    @GetMapping("/all")
    public ApiResponse<Page<RequestCounsellingVO>> getAllRequests(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String searchBy,
        @RequestParam(required = false, defaultValue = "") String keyword
    ) {
        Page<RequestCounsellingVO> requests = requestCounsellingService.getAllRequests(
            page, size, searchBy, keyword
        );
        return ApiResponse.<Page<RequestCounsellingVO>>builder()
            .code(HttpStatus.OK.value())
            .message("All request counselling retrieved successfully")
            .data(requests)
            .build();
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
    public ApiResponse<Void> updateRequestCounsellingByAdmin(@Valid @RequestBody RequestCounsellingUpdateDTO request) {
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

    @Operation(summary = "List All Reminder",
        description = "List all reminder requests that are waiting for School Owner to solve or expired, with optional search by name, email, phone, or school name")
    @GetMapping("/all-reminder")
    public ApiResponse<Page<RequestCounsellingVO>> getAllReminder(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(required = false) String searchBy,
        @RequestParam(required = false, defaultValue = "") String keyword) {

        Page<RequestCounsellingVO> requests = reminderService.getAllReminder(
            page, size, Arrays.asList((byte) 0, (byte) 2), searchBy, keyword.trim()
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
