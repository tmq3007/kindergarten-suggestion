package fa.pjb.back.service;

public interface EmailService {

    String sendLinkPasswordResetEmail(String to, String name, String resetLink);
    String sendUsernamePassword(String to, String name, String username, String password);
}
