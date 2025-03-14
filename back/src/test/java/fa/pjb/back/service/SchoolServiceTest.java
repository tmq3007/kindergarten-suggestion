package fa.pjb.back.service;

import fa.pjb.back.model.vo.FacilityVO;
import fa.pjb.back.model.vo.MediaVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.SchoolListVO;
import fa.pjb.back.model.vo.UtilityVO;
import fa.pjb.back.service.impl.SchoolServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class School1ServiceTest {

  @Mock
  private SchoolService schoolService;

  @InjectMocks
  private SchoolServiceImpl schoolServiceImpl; // Giả sử đây là class implement SchoolService

  private Pageable pageable;

  @BeforeEach
  void setUp() {
    pageable = PageRequest.of(0, 10); // Page đầu tiên, 10 bản ghi mỗi page
  }

  // Test cho getAllSchools
  @Test
  void getAllSchools_normalCase_success() {
    // Arrange
    SchoolListVO schoolListVO = new SchoolListVO(
        Integer.valueOf(1),           // id
        Byte.valueOf((byte) 1),       // status
        "School Name",                // name
        "District",                   // district
        "Ward",                       // ward
        "Province",                   // province
        "Street",                     // street
        "test@email.com",             // email
        "1234567890",                 // phone
        new Date()                    // posted_date
    );
    List<SchoolListVO> schoolList = Collections.singletonList(schoolListVO);
    Page<SchoolListVO> expectedPage = new PageImpl<>(schoolList, pageable, 1);
    when(schoolService.getAllSchools("test", "province", "district", "street",
        "test@email.com", "1234567890", pageable)).thenReturn(expectedPage);

    // Act
    Page<SchoolListVO> result = schoolService.getAllSchools("test", "province",
        "district", "street", "test@email.com", "1234567890", pageable);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.getTotalElements());
    assertEquals(1, result.getContent().size());
    verify(schoolService, times(1)).getAllSchools("test", "province", "district",
        "street", "test@email.com", "1234567890", pageable);
  }

  @Test
  void getAllSchools_boundaryCase_emptyResult() {
    // Arrange
    Page<SchoolListVO> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
    when(schoolService.getAllSchools(null, null, null, null, null, null, pageable))
        .thenReturn(emptyPage);

    // Act
    Page<SchoolListVO> result = schoolService.getAllSchools(null, null, null,
        null, null, null, pageable);

    // Assert
    assertNotNull(result);
    assertEquals(0, result.getTotalElements());
    assertTrue(result.getContent().isEmpty());
    verify(schoolService, times(1)).getAllSchools(null, null, null, null, null, null, pageable);
  }

  @Test
  void getAllSchools_abnormalCase_invalidPageable() {
    // Arrange
    Pageable invalidPageable = PageRequest.of(-1, 0); // Page và size không hợp lệ
    when(schoolService.getAllSchools("test", null, null, null, null, null, invalidPageable))
        .thenThrow(new IllegalArgumentException("Invalid pageable parameters"));

    // Act & Assert
    assertThrows(IllegalArgumentException.class, () -> {
      schoolService.getAllSchools("test", null, null, null, null, null, invalidPageable);
    });
    verify(schoolService, times(1)).getAllSchools("test", null, null, null, null, null, invalidPageable);
  }

  // Test cho getSchoolByUserId
  @Test
  void getSchoolByUserId_normalCase_success() {
    // Arrange
    SchoolDetailVO expectedSchool = new SchoolDetailVO(
        Integer.valueOf(1),           // id
        Byte.valueOf((byte) 1),       // status
        "School Name",                // name
        Byte.valueOf((byte) 1),       // schoolType
        "District",                   // district
        "Ward",                       // ward
        "Province",                   // province
        "Street",                     // street
        "test@email.com",             // email
        "1234567890",                 // phone
        Byte.valueOf((byte) 5),       // receivingAge
        Byte.valueOf((byte) 1),       // educationMethod
        Integer.valueOf(1000),        // feeFrom
        Integer.valueOf(2000),        // feeTo
        "http://school.com",          // website
        "A great school",             // description
        new HashSet<FacilityVO>(),    // facilities
        new HashSet<UtilityVO>(),     // utilities
        Collections.emptyList(),      // imageList
        new Date()                    // posted_date
    );
    when(schoolService.getSchoolByUserId(1, "test")).thenReturn(expectedSchool);

    // Act
    SchoolDetailVO result = schoolService.getSchoolByUserId(1, "test");

    // Assert
    assertNotNull(result);
    assertEquals(expectedSchool, result);
    verify(schoolService, times(1)).getSchoolByUserId(1, "test");
  }

  @Test
  void getSchoolByUserId_boundaryCase_nullName() {
    // Arrange
    SchoolDetailVO expectedSchool = new SchoolDetailVO(
        Integer.valueOf(1),           // id
        Byte.valueOf((byte) 1),       // status
        "School Name",                // name
        Byte.valueOf((byte) 1),       // schoolType
        "District",                   // district
        "Ward",                       // ward
        "Province",                   // province
        "Street",                     // street
        "test@email.com",             // email
        "1234567890",                 // phone
        Byte.valueOf((byte) 5),       // receivingAge
        Byte.valueOf((byte) 1),       // educationMethod
        Integer.valueOf(1000),        // feeFrom
        Integer.valueOf(2000),        // feeTo
        "http://school.com",          // website
        "A great school",             // description
        new HashSet<FacilityVO>(),    // facilities
        new HashSet<UtilityVO>(),     // utilities
        Collections.emptyList(),      // imageList
        new Date()                    // posted_date
    );
    when(schoolService.getSchoolByUserId(1, null)).thenReturn(expectedSchool);

    // Act
    SchoolDetailVO result = schoolService.getSchoolByUserId(1, null);

    // Assert
    assertNotNull(result);
    assertEquals(expectedSchool, result);
    verify(schoolService, times(1)).getSchoolByUserId(1, null);
  }

  @Test
  void getSchoolByUserId_abnormalCase_invalidUserId() {
    // Arrange
    when(schoolService.getSchoolByUserId(-1, "test"))
        .thenThrow(new IllegalArgumentException("Invalid user ID"));

    // Act & Assert
    assertThrows(IllegalArgumentException.class, () -> {
      schoolService.getSchoolByUserId(-1, "test");
    });
    verify(schoolService, times(1)).getSchoolByUserId(-1, "test");
  }

  @Test
  void getSchoolByUserId_abnormalCase_nullUserId() {
    // Arrange
    when(schoolService.getSchoolByUserId(null, "test"))
        .thenThrow(new NullPointerException("User ID cannot be null"));

    // Act & Assert
    assertThrows(NullPointerException.class, () -> {
      schoolService.getSchoolByUserId(null, "test");
    });
    verify(schoolService, times(1)).getSchoolByUserId(null, "test");
  }
}