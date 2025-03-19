package fa.pjb.back.event.model;

public record SchoolApprovedEvent (
    String email,
    String schoolName,
    String schoolDetailedLink
) {}
