package fa.pjb.back;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.UserRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.List;


@SpringBootTest
class BackApplicationTests {

    private static final Logger log = LogManager.getLogger(BackApplicationTests.class);
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
                System.out.println(all);
            }
        } catch (Exception e) {
            System.out.println("Kết nối cơ sở dữ liệu thất bại: " + e.getCause());
        }
    }

    @Test
    @Transactional
    public void testLazyLoad(){
        User user = userRepository.findById(1).orElseThrow(UserNotFoundException::new);
        Parent parent = user.getParent();
        log.info("parent: {}", parent);
    }

}
