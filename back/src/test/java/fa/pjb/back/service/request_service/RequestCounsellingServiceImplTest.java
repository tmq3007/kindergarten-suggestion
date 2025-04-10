package fa.pjb.back.service.request_service;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.mapper.RequestCounsellingMapper;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.impl.RequestCounsellingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestCounsellingServiceImplTest {

    @Mock
    private RequestCounsellingRepository requestCounsellingRepository;

    @Mock
    private ParentRepository parentRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private RequestCounsellingMapper requestCounsellingMapper;

    @InjectMocks
    private RequestCounsellingServiceImpl requestCounsellingService;

    private RequestCounsellingDTO validRequestDto;
    private School validSchool;
    private Parent validParent;
    private RequestCounselling savedRequest;

    @BeforeEach
    void setUp() {
        validRequestDto = new RequestCounsellingDTO(
                1,  // userId
                1,  // schoolId
                "Test inquiry",
                (byte)0,  // status
                "test@example.com",
                "1234567890",
                "Test Name",
                LocalDateTime.now().plusDays(1)
        );

        validSchool = new School();
        validSchool.setId(1);

        User user = new User();
        user.setId(1);
        user.setFullname("Parent Name");
        user.setPhone("1234567890");

        validParent = new Parent();
        validParent.setId(1);
        validParent.setUser(user);

        savedRequest = new RequestCounselling();
        savedRequest.setId(1);
        savedRequest.setParent(validParent);
        savedRequest.setSchool(validSchool);
        savedRequest.setName("Test Name");
        savedRequest.setEmail("test@example.com");
        savedRequest.setPhone("1234567890");
        savedRequest.setStatus((byte)0);
    }

    @Test
    void createRequestCounselling_WithValidParent_ShouldSucceed() {
        // Setup
        when(parentRepository.findParentByUserId(1)).thenReturn(validParent);
        when(schoolRepository.findSchoolBySchoolId(1)).thenReturn(Optional.of(validSchool));
        when(requestCounsellingRepository.save(any(RequestCounselling.class))).thenReturn(savedRequest);

        // Mock the mapper to return a non-null VO
        RequestCounsellingVO mockVO = mock(RequestCounsellingVO.class);
        when(requestCounsellingMapper.toRequestCounsellingVO(savedRequest)).thenReturn(mockVO);

        // Execute
        RequestCounsellingVO result = requestCounsellingService.createRequestCounselling(validRequestDto);

        // Verify
        assertNotNull(result);
        assertEquals(mockVO, result);
        verify(requestCounsellingRepository).save(any(RequestCounselling.class));
    }

    // Abnormal case - non-existent user
    @Test
    void createRequestCounselling_WithNonExistentUser_ShouldThrowException() {
        validRequestDto = new RequestCounsellingDTO(
                999,  // non-existent userId
                1,
                "Test inquiry",
                (byte)0,
                "test@example.com",
                "1234567890",
                "Test Name",
                LocalDateTime.now().plusDays(1)
        );

        when(parentRepository.findParentByUserId(999)).thenReturn(null);

        assertThrows(UserNotFoundException.class, () -> {
            requestCounsellingService.createRequestCounselling(validRequestDto);
        });
    }

    // Abnormal case - non-existent school
    @Test
    void createRequestCounselling_WithNonExistentSchool_ShouldThrowException() {
        when(parentRepository.findParentByUserId(1)).thenReturn(validParent);
        when(schoolRepository.findSchoolBySchoolId(1)).thenReturn(Optional.empty());

        assertThrows(SchoolNotFoundException.class, () -> {
            requestCounsellingService.createRequestCounselling(validRequestDto);
        });
    }

    // Boundary case - minimum required fields
    @Test
    void createRequestCounselling_WithMinimumFields_ShouldSucceed() {
        RequestCounsellingDTO minimalDto = new RequestCounsellingDTO(
                null,  // no user
                1,
                null,  // no inquiry
                (byte)0,
                "a@b.c",  // minimal email
                "1",  // minimal phone
                "A",  // minimal name
                LocalDateTime.now().plusDays(1)
        );

        when(schoolRepository.findSchoolBySchoolId(1)).thenReturn(Optional.of(validSchool));
        when(requestCounsellingRepository.save(any(RequestCounselling.class))).thenReturn(savedRequest);

        assertDoesNotThrow(() -> {
            requestCounsellingService.createRequestCounselling(minimalDto);
        });
    }

}