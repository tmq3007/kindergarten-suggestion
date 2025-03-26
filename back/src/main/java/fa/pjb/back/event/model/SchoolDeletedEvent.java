package fa.pjb.back.event.model;

public record SchoolDeletedEvent(
    String email,
    String schoolName,
    String response
) {
}
