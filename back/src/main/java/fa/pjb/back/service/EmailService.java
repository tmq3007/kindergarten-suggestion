package fa.pjb.back.service;

import java.util.concurrent.CompletableFuture;

public interface EmailService {

    String sendLinkPasswordResetEmail(String to, String name, String resetLink);
    String sendUsernamePassword(String to, String name, String username, String password);
    String sendSchoolApprovedEmail(String to, String schoolName, String detailLink);
    String sendSchoolRejectedEmail(String to, String schoolName);
    String sendSchoolPublishedEmail(String to, String schoolName, String username, String detailLink);
    boolean sendSubmitSchool(String to, String schoolName, String username, String detailLink);
    CompletableFuture<Boolean> sendSubmitEmailToAllAdmin(String schoolName, String username, String detailLink);
}
