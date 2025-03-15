package fa.pjb.back.service.school_service;

import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.impl.SchoolServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Test class for retrieving school details by user ID.
 */
@ExtendWith(MockitoExtension.class)
public class GetSchoolByUserIdTest {

  @Mock
  private SchoolRepository schoolRepository;

  @Mock
  private SchoolMapper schoolMapper;

  @InjectMocks
  private SchoolServiceImpl schoolService;

  private School school;
  private SchoolDetailVO schoolVO;

  /**
   * Setup method to initialize test data before each test case.
   */
  @BeforeEach
  void setUp() {
    school = School.builder()
        .id(1)
        .name("Test School")
        .province("Test Province")
        .district("Test District")
        .email("test@school.com")
        .phone("+84123456789")
        .build();

    schoolVO = SchoolDetailVO.builder()
        .id(1)
        .name("Test School")
        .province("Test Province")
        .district("Test District")
        .email("test@school.com")
        .phone("+84123456789")
        .build();
  }

  /**
   * Normal Case:
   * Description: Successfully retrieve school details with valid user ID and name.
   * Expected: Returns a SchoolDetailVO object.
   */
  @Test
  void getSchoolByUserId_Success_WithName() {
    // Arrange
    Integer userId = 1;
    when(schoolRepository.findSchoolByUserId(userId, "Test School"))
        .thenReturn(Optional.of(school));
    when(schoolMapper.toSchoolDetailVO(school)).thenReturn(schoolVO);

    // Act
    SchoolDetailVO result = schoolService.getSchoolByUserId(userId, "Test School");

    // Assert
    assertNotNull(result);
    assertEquals(1, result.id());
    assertEquals("Test School", result.name());
    assertEquals("Test Province", result.province());

    verify(schoolRepository, times(1)).findSchoolByUserId(userId, "Test School");
    verify(schoolMapper, times(1)).toSchoolDetailVO(school);
  }

  /**
   * Normal Case:
   * Description: Successfully retrieve school details with valid user ID and null name.
   * Expected: Returns a SchoolDetailVO object.
   */
  @Test
  void getSchoolByUserId_Success_NoName() {
    // Arrange
    Integer userId = 1;
    when(schoolRepository.findSchoolByUserId(userId, null))
        .thenReturn(Optional.of(school));
    when(schoolMapper.toSchoolDetailVO(school)).thenReturn(schoolVO);

    // Act
    SchoolDetailVO result = schoolService.getSchoolByUserId(userId, null);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.id());
    assertEquals("Test School", result.name());

    verify(schoolRepository, times(1)).findSchoolByUserId(userId, null);
    verify(schoolMapper, times(1)).toSchoolDetailVO(school);
  }

  /**
   * Boundary Case:
   * Description: Retrieve school details with minimum valid user ID (0).
   * Expected: Returns a SchoolDetailVO object if valid.
   */
  @Test
  void getSchoolByUserId_Boundary_MinUserId() {
    // Arrange
    Integer userId = 0; // Giả định 0 là user ID hợp lệ tối thiểu
    when(schoolRepository.findSchoolByUserId(userId, "Test School"))
        .thenReturn(Optional.of(school));
    when(schoolMapper.toSchoolDetailVO(school)).thenReturn(schoolVO);

    // Act
    SchoolDetailVO result = schoolService.getSchoolByUserId(userId, "Test School");

    // Assert
    assertNotNull(result);
    assertEquals(1, result.id());
    assertEquals("Test School", result.name());

    verify(schoolRepository, times(1)).findSchoolByUserId(userId, "Test School");
    verify(schoolMapper, times(1)).toSchoolDetailVO(school);
  }

  /**
   * Boundary Case:
   * Description: Retrieve school details with maximum valid user ID (Integer.MAX_VALUE).
   * Expected: Returns a SchoolDetailVO object if valid.
   */
  @Test
  void getSchoolByUserId_Boundary_MaxUserId() {
    // Arrange
    Integer userId = Integer.MAX_VALUE;
    when(schoolRepository.findSchoolByUserId(userId, "Test School"))
        .thenReturn(Optional.of(school));
    when(schoolMapper.toSchoolDetailVO(school)).thenReturn(schoolVO);

    // Act
    SchoolDetailVO result = schoolService.getSchoolByUserId(userId, "Test School");

    // Assert
    assertNotNull(result);
    assertEquals(1, result.id());
    assertEquals("Test School", result.name());

    verify(schoolRepository, times(1)).findSchoolByUserId(userId, "Test School");
    verify(schoolMapper, times(1)).toSchoolDetailVO(school);
  }

  /**
   * Abnormal Case:
   * Description: Attempt to retrieve school details for a non-existent user ID.
   * Expected: Throws RuntimeException.
   */
  @Test
  void getSchoolByUserId_NoResult() {
    // Arrange
    Integer userId = 999;
    when(schoolRepository.findSchoolByUserId(userId, "Test School"))
        .thenReturn(Optional.empty());

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      schoolService.getSchoolByUserId(userId, "Test School");
    });

    assertEquals("School not found for user ID: 999", exception.getMessage());

    verify(schoolRepository, times(1)).findSchoolByUserId(userId, "Test School");
    verify(schoolMapper, never()).toSchoolDetailVO(any());
  }
}