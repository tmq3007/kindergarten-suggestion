package fa.pjb.back.config;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import lombok.extern.slf4j.Slf4j;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

@Slf4j
public class SSHConnection {
    // Biến giữ phiên SSH toàn cục, giúp quản lý trạng thái của SSH Tunnel trong suốt vòng đời ứng dụng
    private static Session session;

    public static void setupSshTunnel(String sshHost, String sshUser, String sshKeyPath, int sshPort, String dbHost, int dbPort) throws Exception {
        // Tạo kết nối SSH
        JSch jsch = new JSch();
        // Nạp SSH private key
        jsch.addIdentity(sshKeyPath);
        // Thiết lập phiên SSH với các thông tin cấu hình chính của máy chủ SSH
        Session session = jsch.getSession(sshUser, sshHost, sshPort);
        // Cấu hình SSH
        Properties config = new Properties();
        // Tắt kiểm tra SSH HostKey
        config.put("StrictHostKeyChecking", "no");
        session.setConfig(config);
        session.connect();

        // Chuyển tiếp kết nối từ localhost:3306 đến database-host:3306 qua SSH Tunnel
        // >>> Ứng dụng sẽ kết nối MySQL bằng localhost:3306 nhưng thực chất dữ liệu được chuyển đến database từ xa thông qua SSH
        int localPort = 3306;
        session.setPortForwardingL(localPort, dbHost, dbPort);
        log.info("SSH connection established on port {}", localPort);
    }

    public static void closeSshTunnel() {
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
    }
}
