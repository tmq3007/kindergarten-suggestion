package fa.pjb.back.service.impl;

import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;


@Slf4j
@RequiredArgsConstructor
@Service
public class EmailServiceImpl implements EmailService {


    private final JavaMailSender mailSender;

    private final Configuration freemarkerConfig;

    private final UserRepository userRepository;

    private void sendEmailWithTemplate(String to, String subject, String templateName, Map<String, Object> model) throws MessagingException, IOException, TemplateException {

        // RFC 5321 limit max length of an email
        if (to.length() > 254) {
            throw new MessagingException("Email address too long");
        }
        // Load email template
        Template template = freemarkerConfig.getTemplate("email/" + templateName + ".html");

        // Process template with model data
        String htmlBody = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);

        // Create MimeMessage
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        // Transmit data into mail body
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        // Send mail
        mailSender.send(message);
    }


    /**
     * Sends an email to the user with a link to reset their password.
     *
     * @param to        the recipient's email address
     * @param name      the user's name
     * @param resetLink the link to reset the password
     * @return a message indicating the success or failure of the email sending
     */
    @Override
    public String sendLinkPasswordResetEmail(String to, String name, String resetLink) {
        try {
            // Create a model to hold the data to be sent in the email
            Map<String, Object> model = new HashMap<>();
            model.put("name", name);
            model.put("resetLink", resetLink);

            // Send mail using the "password-reset.html" template
            sendEmailWithTemplate(to, "Password Reset", "password-reset", model);

            // Return a message indicating the success of the email sending
            return "Link password reset sent successfully!";

            // Catch error
        } catch (MessagingException | IOException | TemplateException e) {

            // Return a message indicating the error
            return "Error while sending email: " + e.getMessage();
        }
    }

    @Override
    public String sendUsernamePassword(String to, String name, String username, String password) {
        try {
            Map<String, Object> model = new HashMap<>();
            model.put("name", name);
            model.put("username", username);
            model.put("password", password);

            //gui mail
            sendEmailWithTemplate(to, "Username Password", "create-user", model);
            return "send username password successfully!";
        } catch (MessagingException | IOException | TemplateException e) {

            return "Error while sending email: " + e.getMessage();
        }
    }

    /**
     * Sends an email to the user about the school approval.
     *
     * @param to         the recipient's email address
     * @param schoolName the name of the school
     * @param detailLink the link to the school detail page
     * @return a message indicating the success or failure of the email sending
     */
    @Override
    public String sendSchoolApprovedEmail(String to, String schoolName, String detailLink) {
        try {
            // Create a model to hold the data to be sent in the email
            Map<String, Object> model = new HashMap<>();
            model.put("schoolName", schoolName);
            model.put("detailsLink", detailLink);

            // Send the email with the template
            sendEmailWithTemplate(to, "School Approved", "approved-school", model);
            return "send school approved successfully!";
        } catch (MessagingException | IOException | TemplateException e) {

            // Return an error message if there was a problem sending the email
            return "Error while sending email: " + e.getMessage();
        }
    }

    @Override
    public String sendSchoolRejectedEmail(String to, String schoolName) {
        try {
            // Create a model to hold the data to be sent in the email
            Map<String, Object> model = new HashMap<>();
            model.put("schoolName", schoolName);

            // Send the email with the template
            sendEmailWithTemplate(to, "School Rejected", "rejected-school", model);
            return "send school rejected successfully!";
        } catch (MessagingException | IOException | TemplateException e) {

            // Return an error message if there was a problem sending the email
            return "Error while sending email: " + e.getMessage();
        }
    }

    @Override
    public String sendSchoolPublishedEmail(String to, String schoolName, String username, String detailLink) {
        try {
            // Create a model to hold the data to be sent in the email
            Map<String, Object> model = new HashMap<>();
            model.put("schoolName", schoolName);
            model.put("username", username);
            model.put("detailsLink", detailLink);

            // Send the email with the template
            sendEmailWithTemplate(to, "School Published", "published-school", model);
            return "send school published successfully!";
        } catch (MessagingException | IOException | TemplateException e) {

            // Return an error message if there was a problem sending the email
            return "Error while sending email: " + e.getMessage();
        }
    }

    @Override
    public boolean sendSubmitSchool(String to, String schoolName, String username, String detailLink) {
        try {
            Map<String, Object> model = new HashMap<>();
            model.put("schoolName", schoolName);
            model.put("username", username);
            model.put("detailsLink", detailLink);
            //Send email
            sendEmailWithTemplate(to, "no-reply-email-KTS-system <Interview schedule title>", "submit-school", model);
            return true;
        } catch (MessagingException | IOException | TemplateException e) {
            return false;
        }
    }

    @Override
    public CompletableFuture<Boolean> sendSubmitEmailToAllAdmin(String schoolName, String username, String detailLink) {
        List<String> adminEmails = userRepository.findActiveAdminEmails(ERole.ROLE_ADMIN);
        if (adminEmails.isEmpty()) {
            return CompletableFuture.completedFuture(false);
        }
        ExecutorService executor = Executors.newFixedThreadPool(Math.min(adminEmails.size(), 10));
        List<CompletableFuture<Boolean>> emailFutures = adminEmails.stream()
                .map(adminEmail -> CompletableFuture.supplyAsync(
                        () -> sendSubmitSchool(adminEmail, schoolName, username, detailLink),
                        executor
                ))
                .toList();
        return CompletableFuture.allOf(emailFutures.toArray(new CompletableFuture[0]))
                .thenApply(v -> {
                    executor.shutdown();
                    return emailFutures.stream() // True if all succeeded
                            .allMatch(future -> {
                                try {
                                    return future.get(); // Get the boolean result
                                } catch (Exception e) {
                                    log.error("Error processing email result: {}", e.getMessage());
                                    return false;
                                }
                            });
                })
                .exceptionally(throwable -> { //exception handle
                    executor.shutdown();
                    log.error("Error in admin email batch: {}", throwable.getMessage());
                    return false;
                });
    }

}
