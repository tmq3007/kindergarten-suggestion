//package fa.pjb.back.service;
//
//import fa.pjb.back.model.entity.User;
//import fa.pjb.back.model.enums.ERole;
//import fa.pjb.back.model.mapper.UserProjection;
//import fa.pjb.back.model.vo.UserVO;
//import fa.pjb.back.repository.ParentRepository;
//import fa.pjb.back.repository.UserRepository;
//import fa.pjb.back.service.UserService;
//import fa.pjb.back.service.impl.UserServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.*;
//
//import java.time.LocalDate;
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class UserServiceTest {
//
//    @Mock
//    private UserRepository userRepository;
//    @Mock
//    private ParentRepository parentRepository;
//
//    @InjectMocks
//    private UserServiceImpl userService;
//
//    private Pageable pageable;
//    private List<User> userList;
//
//    @BeforeEach
//    void setUp() {
//        pageable = PageRequest.of(0, 10); // Page 0, size 5
//
//        userList = List.of(
//                User.builder().id(1).username("user1").email("user1@example.com").fullname("Alice Johnson").role(ERole.ROLE_PARENT).phone("+84123456701").status(true).dob(LocalDate.of(1995, 5, 10)).build(),
//                User.builder().id(2).username("user2").email("user2@example.com").fullname("Bob Smith").role(ERole.ROLE_ADMIN).phone("+84123456702").status(true).dob(LocalDate.of(1988, 3, 15)).build(),
//                User.builder().id(3).username("user3").email("user3@example.com").fullname("Charlie Brown").role(ERole.ROLE_PARENT).phone("+84123456703").status(true).dob(LocalDate.of(1992, 7, 20)).build(),
//                User.builder().id(4).username("user4").email("user4@example.com").fullname("David White").role(ERole.ROLE_SCHOOL_OWNER).phone("+84123456704").status(false).dob(LocalDate.of(2000, 1, 25)).build(),
//                User.builder().id(5).username("user5").email("user5@example.com").fullname("Emma Green").role(ERole.ROLE_PARENT).phone("+84123456705").status(true).dob(LocalDate.of(1997, 9, 30)).build(),
//                User.builder().id(6).username("user6").email("user6@example.com").fullname("Fiona Black").role(ERole.ROLE_ADMIN).phone("+84123456706").status(true).dob(LocalDate.of(1985, 12, 5)).build()
//        );
//    }
//
//    /**
//     * ✅ Normal Case: Get all users with pagination
//     */
//    @Test
//    void testGetAllUsers_NormalCase() {
//        Page<User> userPage = new PageImpl<>(userList.subList(0, 5), pageable, userList.size());
//
//        when(userRepository.findAllByCriteria(null, null, null, null, pageable))
//                .thenReturn(userPage);
//
//        Page<UserVO> result = userService.getAllUsers(0,5, null, null, null, null);
//
//        assertNotNull(result);
//        assertEquals(5, result.getContent().size());
//        assertEquals("Alice Johnson", result.getContent().get(0).fullname());
//    }
//
//    /**
//     * ✅ Normal Case: Filter users by role
//     */
//    @Test
//    void testGetAllUsers_FilterByRole() {
//        List<User> filteredUsers = userList.stream().filter(user -> user.getRole() == ERole.ROLE_PARENT).toList();
//        Page<User> userPage = new PageImpl<>(filteredUsers, pageable, filteredUsers.size());
//
//        when(userRepository.findAllByCriteria(ERole.ROLE_PARENT, null, null, null, pageable))
//                .thenReturn(userPage);
//
//        Page<UserVO> result = userService.getAllUsers(0,5, "ROLE_PARENT", null, null, null);
//
//        assertNotNull(result);
//        assertEquals(filteredUsers.size(), result.getContent().size());
//    }
//    /**
//     * ✅ Filter by phone number.
//     */
//    @Test
//    void testGetAllUsers_FilterByPhone() {
//        Page<User> userPage = new PageImpl<>(List.of(userList.get(2)), pageable, 1);
//        when(userRepository.findAllByCriteria(null, null, null, "+84123456703", pageable))
//                .thenReturn(userPage);
//
//        Page<UserVO> result = userService.getAllUsers(0,5, null, null, null, "+84123456703");
//
//        assertNotNull(result);
//        assertEquals(1, result.getContent().size());
//        assertEquals("Charlie Brown", result.getContent().get(0).fullname());
//    }
//    /**
//     * ✅ Filter by email.
//     */
//    @Test
//    void testGetAllUsers_FilterByEmail() {
//        Page<UserProjection> userPage = new PageImpl<>(List.of(userList.get(1)), pageable, 1);
//        when(userRepository.findAllByCriteria(null, "user2@example.com", null, null, pageable))
//                .thenReturn(userPage);
//
//        Page<UserVO> result = userService.getAllUsers(0,5, null, "user2@example.com", null, null);
//
//        assertNotNull(result);
//        assertEquals(1, result.getContent().size());
//        assertEquals("Bob Smith", result.getContent().get(0).fullname());
//    }
//    /**
//     * ✅ Normal Case: Filter by email, name, phone
//     */
//    @Test
//    void testGetAllUsers_FilterByEmailNamePhone() {
//        Page<User> userPage = new PageImpl<>(List.of(userList.get(0)), pageable, 1);
//        when(userRepository.findAllByCriteria(null, "user1@example.com", "Alice Johnson", "+84123456701", pageable))
//                .thenReturn(userPage);
//
//        Page<UserVO> result = userService.getAllUsers(0,5, null, "user1@example.com", "Alice Johnson", "+84123456701");
//
//        assertNotNull(result);
//        assertEquals(1, result.getContent().size());
//        assertEquals("Alice Johnson", result.getContent().get(0).fullname());
//    }
//    /**
//     * ✅ Normal Case: No Matching Users
//     */
//    @Test
//    void testGetAllUsers_NoResults() {
//        Page<User> emptyPage = Page.empty();
//        when(userRepository.findAllByCriteria(any(), any(), any(), any(), any()))
//                .thenReturn(emptyPage);
//
//        Page<UserVO> result = userService.getAllUsers(0,5, null, "nonexistent@example.com", null, null);
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//    }
//    /**
//     * ✅ Normal Case: Search should be case insensitive.
//     */
//    @Test
//    void testGetAllUsers_CaseInsensitiveSearch() {
//        Page<User> userPage = new PageImpl<>(List.of(userList.get(0)), pageable, 1);
//        when(userRepository.findAllByCriteria(null, "USER1@EXAMPLE.COM", null, null, pageable))
//                .thenReturn(userPage);
//
//        Page<UserVO> result = userService.getAllUsers(0,5, null, "USER1@EXAMPLE.COM", null, null);
//
//        assertNotNull(result);
//        assertEquals(1, result.getContent().size());
//        assertEquals("Alice Johnson", result.getContent().get(0).fullname());
//    }
//    /**
//     * ❌ Abnormal Case: Invalid Role Input
//     */
//    @Test
//    void testGetAllUsers_InvalidRole() {
//        assertThrows(IllegalArgumentException.class, () ->
//                userService.getAllUsers(0,5, "INVALID_ROLE", null, null, null));
//    }
//
//
//}
