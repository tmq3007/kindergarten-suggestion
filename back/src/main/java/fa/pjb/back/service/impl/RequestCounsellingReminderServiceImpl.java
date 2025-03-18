package fa.pjb.back.service.impl;

import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
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

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Slf4j
@Service
public class RequestCounsellingReminderServiceImpl implements RequestCounsellingReminderService {
    private final RequestCounsellingRepository requestCounsellingRepository;
    private final UserRepository userRepository;
    private final SchoolOwnerRepository schoolOwnerRepository;
    private final EmailService emailService;


    // second minute hour day month week
    @Scheduled(cron = "0 0 9 * * ?")
    //@Scheduled(fixedDelay = 10000)
    @Override
    @Transactional(readOnly = true)
    public void checkDueDateAndSendEmail() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        List<RequestCounselling> requests = requestCounsellingRepository.findByStatus((byte) 0);

        for (RequestCounselling request : requests) {
            LocalDate dueDate = request.getDue_date();

            if (dueDate.equals(tomorrow)) {
                sendToAllAdmins(request, dueDate);
                sendToSchoolOwner(request, dueDate);
            } else if (dueDate.isBefore(today)) {
                sendToAllAdmins(request, dueDate);
                sendToSchoolOwner(request, dueDate);
            }
        }
    }

    private void sendToAllAdmins(RequestCounselling request, LocalDate dueDate) {
        List<User> admins = userRepository.findActiveUserByRole(ERole.ROLE_ADMIN);
        if (admins == null || admins.isEmpty()) {
            log.warn("No active admins found");
            return;
        }

        for (User admin : admins) {
            try {
                String adminName = admin.getFullname();
                String schoolId = String.valueOf(request.getSchool().getId());
                String dueDateString = dueDate.toString();
                String schoolName = request.getSchool().getName();
                // Tạo detailsLink
                String detailsLink = "http://your-app-domain/requests/" + request.getId(); // Thay đổi URL theo hệ thống của bạn

                emailService.sendRequestCounsellingReminder(
                        admin.getEmail(),
                        adminName, schoolId, dueDateString, schoolName, detailsLink
                );
                log.info("Email sent to admin {} with template", admin.getEmail());
            } catch (Exception e) {
                log.error("Error sending email to admin {}: {}", admin.getEmail(), e.getMessage());
            }
        }
    }

    private void sendToSchoolOwner(RequestCounselling request, LocalDate dueDate) {
        List<SchoolOwner> schoolOwners = schoolOwnerRepository.findAllBySchoolId(request.getSchool().getId());
        if (schoolOwners == null || schoolOwners.isEmpty()) {
            log.warn("No SchoolOwner found for school id {}", request.getSchool().getId());
            return;
        }

        for (SchoolOwner schoolOwner : schoolOwners) {
            User ownerUser = schoolOwner.getUser();
            if (ownerUser == null) continue;

            try {
                String ownerName = ownerUser.getFullname();

                String schoolId = String.valueOf(request.getSchool().getId());
                String dueDateString = dueDate.toString();
                String schoolName = request.getSchool().getName();
                // Tạo detailsLink
                String detailsLink = "http://your-app-domain/requests/" + request.getId(); // Thay đổi URL theo hệ thống của bạn

                emailService.sendRequestCounsellingReminder(
                        ownerUser.getEmail(),
                        ownerName, schoolId, dueDateString, schoolName, detailsLink
                );
                log.info("Email sent to school owner {} with template", ownerUser.getEmail());
            } catch (Exception e) {
                log.error("Error sending email to school owner {}: {}", ownerUser.getEmail(), e.getMessage());
            }
        }
    }
}

