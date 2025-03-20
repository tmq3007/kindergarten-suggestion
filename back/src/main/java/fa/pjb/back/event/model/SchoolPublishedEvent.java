package fa.pjb.back.event.model;

public record SchoolPublishedEvent(String email, String schoolName, String username, String schoolDetailedLink) {
}
