package fa.pjb.back.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PreDestroy;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Configuration to open SSH Tunnel if run on dev-env
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

    @Override
    public void run(String... args) throws Exception {
        // Check if application is running on dev-env
        String activeProfile = System.getProperty("spring.profiles.active", "dev");
        if ("dev".equals(activeProfile)) {
            // If yes >>> open SSH Tunnel
            SSHConnection.setupSshTunnel(SSH_HOST, SSH_USER, SSH_PRIVATE_KEY, SSH_PORT, DB_HOST, DB_PORT);
        }
    }

    @PreDestroy
    public void shutdown() {
        System.out.println("Closing SSH Tunnel...");
        SSHConnection.closeSshTunnel();
    }

}
