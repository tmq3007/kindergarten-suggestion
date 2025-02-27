package fa.pjb.back.config;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;

import java.util.Properties;

@Slf4j
public class SSHConnection {
    // Variable to hold the global SSH session,
    // helps manage the state of the SSH Tunnel throughout the application's lifecycle
    private static Session session;
    private static final Dotenv dotenv = Dotenv.load();

    public static void setupSshTunnel(String sshHost, String sshUser, String sshKeyPath, int sshPort, String dbHost, int dbPort) throws Exception {
        // Create SSH connection
        JSch jsch = new JSch();
        // Import SSH private key
        jsch.addIdentity(sshKeyPath);
        // Set up the SSH session with the main configuration details of the SSH server
        Session session = jsch.getSession(sshUser, sshHost, sshPort);
        // Config SSH
        Properties config = new Properties();
        // Turn-off SSH HostKey check
        config.put("StrictHostKeyChecking", "no");
        session.setConfig(config);
        session.connect();

        // Forward the connection from localhost:xxx to database-host:3306 via SSH Tunnel
        // The application will connect to MySQL using localhost:xxx,
        // but the data is actually forwarded to the remote database through SSH
        int localPort = 3308;
        session.setPortForwardingL(localPort, dbHost, dbPort);
        log.info("SSH connection established on port {}", localPort);
    }

    public static void closeSshTunnel() {
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
    }
}
