package fa.pjb.back;

import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.util.List;


@SpringBootTest
class BackApplicationTests {

    @Autowired
    DataSource dataSource;
    @Autowired
    UserRepository userRepository;

    @Test
    public void testDataSource() {
        try {
            if (dataSource.getConnection() != null) {
                System.out.println("Kết nối cơ sở dữ liệu thành công!");
                List<User> all = userRepository.findAll();
                System.out.println(all.size());
            }
        } catch (Exception e) {
            System.out.println("Kết nối cơ sở dữ liệu thất bại: " + e.getCause());
        }
    }

}
