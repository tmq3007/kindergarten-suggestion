package fa.pjb.back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class KSSMain {

    public static void main(String[] args) {
        SpringApplication.run(KSSMain.class, args);
    }

}