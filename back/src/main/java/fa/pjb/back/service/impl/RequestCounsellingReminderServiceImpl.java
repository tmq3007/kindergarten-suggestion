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
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime overdueThreshold = now.minusHours(24); // 24 hours ago

        Optional<SchoolOwner> schoolOwner = schoolOwnerRepository.findByUserId(userId);
        if (schoolOwner.isEmpty()) {
            log.warn("No SchoolOwner found for userId: {}", userId);
            return null;
        }

        Integer schoolId = schoolOwner.get().getSchool().getId();

        List<RequestCounselling> requests = requestCounsellingRepository.findBySchoolIdAndStatus(schoolId, (byte) 0);
        int totalOverdueCount = 0;

        for (RequestCounselling request : requests) {
            LocalDateTime dueDate = request.getDue_date();
            if (dueDate.isBefore(overdueThreshold)) {
                totalOverdueCount++;
            }
        }

        if (totalOverdueCount > 0) {
            return RequestCounsellingReminderVO
                    .builder()
                    .title("Request Counselling Reminder")
                    .description("You have " + totalOverdueCount + " request counselling that are overdue.")
                    .build();
        }

        return null;
    }

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 28 17 * * ?")
    @Override
    @Transactional(readOnly = true)
    public void checkDueDateAndSendEmail() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime overdueThreshold = now.minusHours(24);

        List<RequestCounselling> requests = requestCounsellingRepository.findByStatus((byte) 0);
        int totalOverdueCount = 0;
        Map<Integer, Integer> schoolOverdueCounts = new HashMap<>();

        for (RequestCounselling request : requests) {
            LocalDateTime dueDate = request.getDue_date();
            if (dueDate.isBefore(overdueThreshold)) {
                totalOverdueCount++;
                Integer schoolId = request.getSchool().getId();
                schoolOverdueCounts.put(schoolId, schoolOverdueCounts.getOrDefault(schoolId, 0) + 1);
            }
        }

        List<CompletableFuture<Void>> emailFutures = new ArrayList<>();

        // Send email to Admin
        if (totalOverdueCount > 0) {
            emailFutures.addAll(sendToAllAdmins(totalOverdueCount));
        } else {
            log.info("No overdue requests found (over 24 hours).");
        }

        // Send email to School Owners
        for (Map.Entry<Integer, Integer> entry : schoolOverdueCounts.entrySet()) {
            Integer schoolId = entry.getKey();
            int overdueCountForSchool = entry.getValue();
            emailFutures.addAll(sendToSchoolOwner(schoolId, overdueCountForSchool));
        }

        //Wait all email sent
        CompletableFuture.allOf(emailFutures.toArray(new CompletableFuture[0]))
                .exceptionally(throwable -> {
                    log.error("Error occurred while sending emails: {}", throwable.getMessage());
                    return null;
                }).join(); // wait all complete
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