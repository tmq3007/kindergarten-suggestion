package fa.pjb.back.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PreDestroy;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * File cấu hình để mở SSH Tunnel nếu ứng dụng chạy trong môi trường dev
 */
@Component
public class DatabaseInitializer implements CommandLineRunner {
    private static final Dotenv dotenv = Dotenv.load();
    private static final String SSH_HOST = dotenv.get("SSH_HOST");
    private static final String SSH_USER = dotenv.get("SSH_USER");
    private static final String SSH_PRIVATE_KEY = dotenv.get("SSH_PRIVATE_KEY");
    private static final int SSH_PORT = Integer.parseInt(dotenv.get("SSH_PORT"));

    private static final String DB_HOST = dotenv.get("DB_HOST");
    private static final int DB_PORT = Integer.parseInt(dotenv.get("DB_PORT"));
    private static final String DB_NAME = dotenv.get("DB_NAME");
    private static final String DB_USER = dotenv.get("DB_USER");
    private static final String DB_PASSWORD = dotenv.get("DB_PASSWORD");

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra ứng dụng có đang chạy trên môi trường dev không
        String activeProfile = System.getProperty("spring.profiles.active", "dev");

        if ("dev".equals(activeProfile)) {
            // Nếu có thì mở SSH Tunnel
            SSHConnection.setupSshTunnel(SSH_HOST, SSH_USER, SSH_PRIVATE_KEY, SSH_PORT, DB_HOST, DB_PORT);
        }

    }

    @PreDestroy
    public void shutdown() {
        System.out.println("Closing SSH Tunnel...");
        SSHConnection.closeSshTunnel();
    }

}
