package fa.pjb.back;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;


@SpringBootTest
class BackApplicationTests {

    @Autowired
    DataSource dataSource;



    @Test
    public void testDataSource() {
        try {
            if (dataSource.getConnection() != null) {
                System.out.println("Kết nối cơ sở dữ liệu thành công!");
            }
        } catch (Exception e) {
            System.out.println("Kết nối cơ sở dữ liệu thất bại: " + e.getMessage());
        }
    }

    @Test
    public void testCRUD() {

    }


}
