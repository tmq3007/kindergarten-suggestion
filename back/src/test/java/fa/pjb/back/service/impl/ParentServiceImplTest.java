package fa.pjb.back.service.impl;

 import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
 import fa.pjb.back.model.entity.Parent;
 import fa.pjb.back.model.entity.User;
 import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.repository.ParentRepository;
 import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class ParentServiceImplTest {

    @Mock
    private ParentRepository parentRepository;

    @Mock
    private ParentMapper parentMapper;

    @InjectMocks
    private ParentServiceImpl parentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /** Normal Case: Lấy ParentVO thành công */
    @Test
    void getParentById_Success() {
        // Given: Dữ liệu Parent hợp lệ
        Integer userId = 1;
        Parent parent = Parent.builder()
                .id(1)
                .user(User.builder().id(userId).build())
                .district("District A")
                .province("Province A")
                .build();

        ParentVO parentVO = ParentVO.builder()
                .id(1)
                .fullname("Test Parent")
                .email("test@example.com")
                .build();

        // When: Giả lập repository trả về Parent
        when(parentRepository.findParentByUserId(userId)).thenReturn(parent);
        when(parentMapper.toParentVO(parent)).thenReturn(parentVO);

        // Act: Gọi phương thức service
        ParentVO result = parentService.getParentById(userId);

        // Assert: Kiểm tra kết quả
        assertNotNull(result);
        assertEquals("Test Parent", result.fullname());
        assertEquals("test@example.com", result.email());
    }

    /** Abnormal Case: userId không tồn tại */
    @Test
    void getParentById_UserNotFound() {
        // Given: Không tìm thấy userId
        Integer userId = 999;

        // When: Giả lập repository trả về null
        when(parentRepository.findParentByUserId(userId)).thenReturn(null);

        // Act & Assert: Kiểm tra ngoại lệ
        assertThrows(UserNotFoundException.class, () -> parentService.getParentById(userId));
    }

    /** Boundary Case: userId là số âm */
    @Test
    void getParentById_NegativeUserId() {
        // Given: userId âm
        Integer userId = -1;

        // When: Giả lập repository trả về null
        when(parentRepository.findParentByUserId(userId)).thenReturn(null);

        // Act & Assert: Kiểm tra ngoại lệ
        assertThrows(UserNotFoundException.class, () -> parentService.getParentById(userId));
     }

    /** Boundary Case: userId là null */
    @Test
    void getParentById_NullUserId() {
        // Given: userId null
        Integer userId = null;

        // Act & Assert: Kiểm tra ngoại lệ NullPointerException
        assertThrows(NullPointerException.class, () -> parentService.getParentById(null));
     }
}
