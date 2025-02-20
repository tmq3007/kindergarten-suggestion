package fa.pjb.back.service;

public interface EmailService {

    String sendPasswordResetEmail(String to, String resetLink);
}
