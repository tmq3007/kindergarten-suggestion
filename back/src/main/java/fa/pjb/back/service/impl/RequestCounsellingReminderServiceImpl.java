package fa.pjb.back.service.impl;

import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.vo.RequestCounsellingReminderVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.RequestCounsellingReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.persistence.criteria.Predicate;

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
            if (dueDate != null && dueDate.isBefore(overdueThreshold)) {
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

    // Runs every day at 6:46 PM (based on your cron expression "0 46 18 * * ?")
    @Scheduled(cron = "0 46 18 * * ?")
    @Override
    @Transactional(readOnly = true)
    public void checkDueDateAndSendEmail() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime overdueThreshold = now.minusHours(24); // 24 hours ago

        List<RequestCounselling> requests = requestCounsellingRepository.findByStatus((byte) 0);
        int totalOverdueCount = 0;

        // Count overdue requests per school
        Map<Integer, Integer> schoolOverdueCounts = new HashMap<>();

        for (RequestCounselling request : requests) {
            LocalDateTime dueDate = request.getDue_date();
            if (dueDate != null && dueDate.isBefore(overdueThreshold)) { // If overdue by more than 24 hours
                totalOverdueCount++;

                Integer schoolId = request.getSchool().getId();
                schoolOverdueCounts.put(schoolId, schoolOverdueCounts.getOrDefault(schoolId, 0) + 1);
            }
        }

        // Send email to Admins with total overdue requests across the system
        if (totalOverdueCount > 0) {
            sendToAllAdmins(totalOverdueCount);
        } else {
            log.info("No overdue requests found (over 24 hours).");
        }

        log.info("Found {} overdue requests across schools: {}", totalOverdueCount, schoolOverdueCounts.values());
        // Send email to each SchoolOwner with their school's overdue count
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
                String detailsLink = "http://your-app-domain/requests?schoolId=" + schoolId; // Link to school's requests

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

    @Override
    public Page<RequestCounsellingVO> getAllRequests(
        int page, int size, Byte status, String email, String name, String phone,
        String schoolName, LocalDateTime dueDate) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<RequestCounselling> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (email != null && !email.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("email"), email));
            }
            if (name != null && !name.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("name"), name));
            }
            if (phone != null && !phone.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("phone"), phone));
            }
            if (schoolName != null && !schoolName.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("school").get("name"), schoolName));
            }
            if (dueDate != null) {
                predicates.add(criteriaBuilder.equal(root.get("dueDate"), dueDate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // Fetch the paginated data with parent and school
        Page<RequestCounselling> requestPage = requestCounsellingRepository.findAll(specification, pageable);

        // Map the entities to VOs
        return requestPage.map(this::convertToVO);
    }

    private RequestCounsellingVO convertToVO(RequestCounselling request) {
        // Fetch parentName and phone from Parent if parent exists
        String phone = request.getPhone();
        String name = request.getName();

        // Fetch schoolName from School if school exists
        String schoolName = null;
        if (request.getSchool() != null) {
            schoolName = request.getSchool().getName();
        }

        // Build the RequestCounsellingVO
        return RequestCounsellingVO.builder()
            .id(request.getId())
            .schoolName(schoolName != null ? schoolName : "Unknown")
            .inquiry(request.getInquiry())
            .status(request.getStatus())
            .email(request.getEmail())
            .phone(phone)
            .name(name)
            .dueDate(request.getDue_date())
            .build();
    }
}