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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class RequestCounsellingReminderServiceImpl implements RequestCounsellingReminderService {
    private final RequestCounsellingRepository requestCounsellingRepository;
    private final UserRepository userRepository;
    private final SchoolOwnerRepository schoolOwnerRepository;
    private final EmailService emailService;

    public RequestCounsellingReminderVO checkOverdueForSchoolOwner(Integer userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime overdueThreshold = now.minusHours(24); // 24 hours ago

        Optional<SchoolOwner> schoolOwner = schoolOwnerRepository.findByUserId(userId);


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
    @Scheduled(cron = "0 46 18 * * ?")
    @Override
    @Transactional(readOnly = true)
    public void checkDueDateAndSendEmail() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime overdueThreshold = now.minusHours(24); // 24 hours ago

        List<RequestCounselling> requests = requestCounsellingRepository.findByStatus((byte) 0);
        int totalOverdueCount = 0;

        // Đếm số request quá hạn của từng trường
        Map<Integer, Integer> schoolOverdueCounts = new HashMap<>();

        for (RequestCounselling request : requests) {
            LocalDateTime dueDate = request.getDue_date();
            if (dueDate.isBefore(overdueThreshold)) { // Nếu quá hạn trên 24 giờ
                totalOverdueCount++;

                Integer schoolId = request.getSchool().getId();
                schoolOverdueCounts.put(schoolId, schoolOverdueCounts.getOrDefault(schoolId, 0) + 1);
            }
        }

        // Gửi mail cho Admin với tổng số request quá hạn toàn hệ thống
        if (totalOverdueCount > 0) {
            sendToAllAdmins(totalOverdueCount);
        } else {
            log.info("No overdue requests found (over 24 hours).");
        }

        log.info("  overdue requests.",  schoolOverdueCounts.values());
        // Gửi mail cho từng chủ trường với số lượng request quá hạn của riêng trường đó
        for (Map.Entry<Integer, Integer> entry : schoolOverdueCounts.entrySet()) {
            Integer schoolId = entry.getKey();

            int overdueCountForSchool = entry.getValue();

            sendToSchoolOwner(schoolId, overdueCountForSchool);
        }
    }


    private void sendToAllAdmins(int overdueCount) {
        List<User> admins = userRepository.findActiveUserByRole(ERole.ROLE_ADMIN);
        if (admins == null || admins.isEmpty()) {
            log.warn("No active admins found");
            return;
        }

        for (User admin : admins) {
            try {
                String adminName = admin.getFullname();
                String detailsLink = "http://your-app-domain/requests/"; // Replace with your app URL

                emailService.sendRequestCounsellingReminder(
                        admin.getEmail(),
                        adminName,
                        overdueCount,
                        "Overdue by more than 24 hours",
                        detailsLink
                );
                log.info("Email sent to admin {} with {} overdue requests", admin.getEmail(), overdueCount);
            } catch (Exception e) {
                log.error("Error sending email to admin {}: {}", admin.getEmail(), e.getMessage());
            }
        }
    }

    private void sendToSchoolOwner(Integer schoolId, int overdueCount) {
        List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(schoolId);
        if (schoolOwners == null || schoolOwners.isEmpty()) {
            log.warn("No SchoolOwner found for school id {}", schoolId);
            return;
        }

        for (SchoolOwner schoolOwner : schoolOwners) {
            User ownerUser = schoolOwner.getUser();
            if (ownerUser == null) continue;

            try {
                String ownerName = ownerUser.getFullname();
                String detailsLink = "http://your-app-domain/requests?schoolId=" + schoolId; // Link chỉ tới request của trường

                emailService.sendRequestCounsellingReminder(
                        ownerUser.getEmail(),
                        ownerName,
                        overdueCount,
                        "Overdue by more than 24 hours",
                        detailsLink
                );
                log.info("Email sent to school owner {} with {} overdue requests for school {}",
                        ownerUser.getEmail(), overdueCount, schoolId);
            } catch (Exception e) {
                log.error("Error sending email to school owner {}: {}", ownerUser.getEmail(), e.getMessage());
            }
        }
    }

}