package fa.pjb.back.service.impl;

import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.EmailService;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


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


    @Override
    public String sendLinkPasswordResetEmail(String to, String name, String resetLink) {
        try {
            // Transmit data into template Freemarker
            Map<String, Object> model = new HashMap<>();
            model.put("name", name);
            model.put("resetLink", resetLink);

            // Send mail
            sendEmailWithTemplate(to, "Password Reset", "password-reset", model);
            return "Link password reset sent successfully!";


        // Catch error
        } catch (MessagingException | IOException | TemplateException e) {

            return "Error while sending email: " + e.getMessage();
        }
    }

    @Override
    public String sendUsernamePassword(String to, String name, String username, String password) {
        try{
            Map<String,Object> model = new HashMap<>();
            model.put("name",name);
            model.put("username", username);
            model.put("password",password);

            //gui mail
            sendEmailWithTemplate(to, "Username Password", "create-user",model);
            return "send username password successfully!";
        }catch (MessagingException | IOException | TemplateException e) {

            return "Error while sending email: " + e.getMessage();
        }
    }
}
