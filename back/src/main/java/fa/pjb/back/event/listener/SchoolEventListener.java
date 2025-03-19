package fa.pjb.back.event.listener;

import fa.pjb.back.event.model.SchoolApprovedEvent;
import fa.pjb.back.event.model.SchoolPublishedEvent;
import fa.pjb.back.event.model.SchoolRejectedEvent;
import fa.pjb.back.service.EmailService;
import fa.pjb.back.service.impl.EmailServiceImpl;
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
        emailService.sendSchoolRejectedEmail(event.email(), event.schoolName());
    }

    @Async
    @EventListener
    public void handleSchoolPublishedEvent(SchoolPublishedEvent event) {
        emailService.sendSchoolPublishedEmail(event.email(), event.schoolName(), event.username(), event.schoolDetailedLink());
    }
}
