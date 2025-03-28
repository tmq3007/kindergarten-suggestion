package fa.pjb.back.event.listener;

import fa.pjb.back.event.model.*;
import fa.pjb.back.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SchoolEventListener {

    private final EmailService emailService;

    @Async
    @EventListener
    public void handleSchoolApprovedEvent(SchoolApprovedEvent event) {
        emailService.sendSchoolApprovedEmail(event.email(), event.schoolName(), event.schoolDetailedLink());
    }

    @Async
    @EventListener
    public void handleSchoolRejectedEvent(SchoolRejectedEvent event) {
        emailService.sendSchoolRejectedEmail(event.email(), event.schoolName(), event.response());
    }

    @Async
    @EventListener
    public void handleSchoolPublishedEvent(SchoolPublishedEvent event) {
        emailService.sendSchoolPublishedEmail(event.email(), event.schoolName(), event.username(), event.schoolDetailedLink());
    }

    @Async
    @EventListener
    public void handleCounsellingRequestUpdateEvent(CounsellingRequestUpdateEvent event) {
        emailService.sendCounsellingRequestUpdateEmail(event.to(), event.response());
    }

    @Async
    @EventListener
    public void handleSchoolDeletedEvent(SchoolDeletedEvent event) {
        emailService.sendSchoolDeletedEmail(event.email(), event.schoolName(), event.response());
    }

}
