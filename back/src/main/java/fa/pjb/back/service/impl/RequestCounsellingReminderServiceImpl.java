package fa.pjb.back.service.impl;

import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.RequestCounsellingReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@RequiredArgsConstructor
@Slf4j
@Service
public class RequestCounsellingReminderServiceImpl implements RequestCounsellingReminderService {

    private final RequestCounsellingRepository requestCounsellingRepository;
    private final UserRepository userRepository;
    private final SchoolOwnerRepository schoolOwnerRepository;
    private final EmailService emailService;

    @Override
    public RequestCounsellingReminderVO checkOverdueForSchoolOwner(Integer userId) {
        LocalDateTime overdueThreshold = LocalDateTime.now().minusHours(24);

        Optional<SchoolOwner> schoolOwner = schoolOwnerRepository.findByUserId(userId);
        if (schoolOwner.isEmpty()) {
            log.warn("No SchoolOwner found for userId: {}", userId);
            return null;
        }

        Integer schoolId = schoolOwner.get().getSchool().getId();
        long totalOverdueCount = requestCounsellingRepository.countOverdueRequestsBySchoolId(schoolId, (byte) 2, overdueThreshold);

        if (totalOverdueCount > 0) {
            return RequestCounsellingReminderVO.builder()
                    .title("Request Counselling Reminder")
                    .description("You have " + totalOverdueCount + " request counselling that are overdue.")
                    .build();
        }

        return null;
    }


    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 50 10 * * ?")
    @Override
    @Transactional(readOnly = true)
    public void checkDueDateAndSendEmail() {
        LocalDateTime overdueThreshold = LocalDateTime.now().minusHours(24);

        // Lấy số lượng yêu cầu quá hạn cho tất cả các trường
        List<Object[]> results = requestCounsellingRepository.countOverdueRequestsForAllSchools((byte) 2, overdueThreshold);
        Map<Integer, Integer> schoolOverdueCounts = new HashMap<>();
        int totalOverdueCount = 0;

        for (Object[] result : results) {
            Integer schoolId = (Integer) result[0];
            int overdueCount = ((Number) result[1]).intValue();
            schoolOverdueCounts.put(schoolId, overdueCount);
            totalOverdueCount += overdueCount;
        }

        List<CompletableFuture<Void>> emailFutures = new ArrayList<>();

        if (totalOverdueCount > 0) {
            emailFutures.addAll(sendToAllAdmins(totalOverdueCount));
        } else {
            log.info("No overdue requests found (over 24 hours).");
        }

        for (Map.Entry<Integer, Integer> entry : schoolOverdueCounts.entrySet()) {
            emailFutures.addAll(sendToSchoolOwner(entry.getKey(), entry.getValue()));
        }

        CompletableFuture.allOf(emailFutures.toArray(new CompletableFuture[0]))
                .exceptionally(throwable -> {
                    log.error("Error occurred while sending emails: {}", throwable.getMessage());
                    return null;
                }).join();
    }


    private List<CompletableFuture<Void>> sendToAllAdmins(int overdueCount) {
        List<User> admins = userRepository.findActiveUserByRole(ERole.ROLE_ADMIN);
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        if (admins == null || admins.isEmpty()) {
            log.warn("No active admins found");
            return futures;
        }

        for (User admin : admins) {
            String adminName = admin.getFullname();
            String detailsLink = "http://your-app-domain/requests/";

            CompletableFuture<Void> future = emailService.sendRequestCounsellingReminder(
                    admin.getEmail(),
                    adminName,
                    overdueCount,
                    "Overdue by more than 24 hours",
                    detailsLink
            ).whenComplete((result, throwable) -> {
                if (throwable != null) {
                    log.error("Error sending email to admin {}: {}", admin.getEmail(), throwable.getMessage());
                } else {
                    log.info("Email sent to admin {} with {} overdue requests", admin.getEmail(), overdueCount);
                }
            });
            futures.add(future);
        }
        return futures;
    }

    private List<CompletableFuture<Void>> sendToSchoolOwner(Integer schoolId, int overdueCount) {
        List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolId);
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        if (schoolOwners == null || schoolOwners.isEmpty()) {
            log.warn("No SchoolOwner found for school id {}", schoolId);
            return futures;
        }

        for (SchoolOwner schoolOwner : schoolOwners) {
            User ownerUser = schoolOwner.getUser();
            if (ownerUser == null) continue;

            String ownerName = ownerUser.getFullname();
            String detailsLink = "http://your-app-domain/requests?schoolId=" + schoolId;

            CompletableFuture<Void> future = emailService.sendRequestCounsellingReminder(
                    ownerUser.getEmail(),
                    ownerName,
                    overdueCount,
                    "Overdue by more than 24 hours",
                    detailsLink
            ).whenComplete((result, throwable) -> {
                if (throwable != null) {
                    log.error("Error sending email to school owner {}: {}", ownerUser.getEmail(), throwable.getMessage());
                } else {
                    log.info("Email sent to school owner {} with {} overdue requests for school {}",
                            ownerUser.getEmail(), overdueCount, schoolId);
                }
            });
            futures.add(future);
        }
        return futures;
    }

}