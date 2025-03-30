package fa.pjb.back.service.request_service;

import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.model.mapper.RequestCounsellingMapper;
import fa.pjb.back.service.impl.RequestCounsellingReminderServiceImpl;
import java.util.NoSuchElementException;
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
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RequestCounsellingReminderServiceTest {

  @Mock
  private RequestCounsellingRepository requestCounsellingRepository;

  @Mock
  private SchoolOwnerRepository schoolOwnerRepository;

  @Mock
  private RequestCounsellingMapper requestCounsellingMapper;

  @InjectMocks
  private RequestCounsellingReminderServiceImpl service;

  private RequestCounselling requestCounselling;
  private RequestCounsellingVO requestCounsellingVO;
  private School school;

  @BeforeEach
  void setUp() {
    school = new School();
    school.setId(1);
    school.setName("Test School");

    requestCounselling = RequestCounselling.builder()
        .id(1)
        .school(school)
        .name("Test Name")
        .email("test@example.com")
        .phone("1234567890")
        .inquiry("Test inquiry")
        .status((byte) 0)
        .due_date(LocalDateTime.now().plusDays(1))
        .response("Test response")
        .parent(new Parent()) // Giả định có Parent
        .build();

    requestCounsellingVO = new RequestCounsellingVO(
        1,
        "Test School",
        "Test inquiry",
        (byte) 0,
        "test@example.com",
        "1234567890",
        "Test Name",
        null, // address không có trong entity, để null
        LocalDateTime.now().plusDays(1),
        "Test response"
    );
  }

  // Tests for getAllReminder
  @Test
  // Test case 1: Lấy tất cả reminder với page và size hợp lệ, không lọc statuses, không lọc name
  void getAllReminder_validPageAndSize_noStatuses_noName() {
    Pageable pageable = PageRequest.of(0, 10);
    List<RequestCounselling> requestList = Collections.singletonList(requestCounselling);
    Page<RequestCounselling> requestPage = new PageImpl<>(requestList, pageable, 1);

    when(requestCounsellingRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(requestPage);
    when(requestCounsellingMapper.toRequestCounsellingVO(requestCounselling)).thenReturn(requestCounsellingVO);

    Page<RequestCounsellingVO> result = service.getAllReminder(1, 10, null, null);

    assertEquals(1, result.getTotalElements());
    assertEquals("Test Name", result.getContent().get(0).name());
    verify(requestCounsellingRepository).findAll(any(Specification.class), eq(pageable));
  }

  @Test
    // Test case 2: Lấy reminder với statuses cụ thể, không có name
  void getAllReminder_withStatuses_noName() {
    Pageable pageable = PageRequest.of(0, 5);
    List<Byte> statuses = Arrays.asList((byte) 0, (byte) 1);
    List<RequestCounselling> requestList = Collections.singletonList(requestCounselling);
    Page<RequestCounselling> requestPage = new PageImpl<>(requestList, pageable, 1);

    when(requestCounsellingRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(requestPage);
    when(requestCounsellingMapper.toRequestCounsellingVO(requestCounselling)).thenReturn(requestCounsellingVO);

    Page<RequestCounsellingVO> result = service.getAllReminder(1, 5, statuses, null);

    assertEquals(1, result.getTotalElements());
    verify(requestCounsellingRepository).findAll(any(Specification.class), eq(pageable));
  }

  @Test
    // Test case 3: Lấy reminder với name filter, statuses mặc định
  void getAllReminder_withName_defaultStatuses() {
    Pageable pageable = PageRequest.of(0, 10);
    List<RequestCounselling> requestList = Collections.singletonList(requestCounselling);
    Page<RequestCounselling> requestPage = new PageImpl<>(requestList, pageable, 1);

    when(requestCounsellingRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(requestPage);
    when(requestCounsellingMapper.toRequestCounsellingVO(requestCounselling)).thenReturn(requestCounsellingVO);

    Page<RequestCounsellingVO> result = service.getAllReminder(1, 10, null, "test");

    assertEquals(1, result.getTotalElements());
    verify(requestCounsellingRepository).findAll(any(Specification.class), eq(pageable));
  }

  @Test
// Test case 4: Lấy reminder với page/size không hợp lệ (âm), kiểm tra exception
  void getAllReminder_negativePageAndSize() {
    assertThrows(IllegalArgumentException.class, () -> {
      service.getAllReminder(-1, -10, null, null);
    }, "Page index must not be less than zero");
    verifyNoInteractions(requestCounsellingRepository);
  }

  @Test
    // Test case 5: Lấy reminder không có kết quả
  void getAllReminder_noResults() {
    Pageable pageable = PageRequest.of(0, 10);
    Page<RequestCounselling> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

    when(requestCounsellingRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(emptyPage);

    Page<RequestCounsellingVO> result = service.getAllReminder(1, 10, null, null);

    assertEquals(0, result.getTotalElements());
    verify(requestCounsellingRepository).findAll(any(Specification.class), eq(pageable));
  }

  // Tests for getRemindersBySchoolOwner
  @Test
  // Test case 1: Lấy reminder với schoolOwnerId hợp lệ, statuses mặc định
  void getRemindersBySchoolOwner_validSchoolOwner_defaultStatuses() {
    SchoolOwner schoolOwner = new SchoolOwner();
    schoolOwner.setSchool(school);
    Pageable pageable = PageRequest.of(0, 10);
    List<RequestCounselling> requestList = Collections.singletonList(requestCounselling);
    Page<RequestCounselling> requestPage = new PageImpl<>(requestList, pageable, 1);

    when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
    when(requestCounsellingRepository.findBySchoolIdAndStatusIn(eq(1), anyList(), eq(pageable))).thenReturn(requestPage);
    when(requestCounsellingMapper.toRequestCounsellingVO(requestCounselling)).thenReturn(requestCounsellingVO);

    Page<RequestCounsellingVO> result = service.getRemindersBySchoolOwner(1, 10, 1, null);

    assertEquals(1, result.getTotalElements());
    verify(requestCounsellingRepository).findBySchoolIdAndStatusIn(eq(1), anyList(), eq(pageable));
  }

  @Test
// Test case 2: Lấy reminder với schoolOwnerId không tồn tại, kiểm tra exception
  void getRemindersBySchoolOwner_schoolOwnerNotFound() {
    when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class, () -> {
      service.getRemindersBySchoolOwner(1, 10, 1, null);
    }, "No value present");

    verify(schoolOwnerRepository).findByUserId(1);
    verifyNoInteractions(requestCounsellingRepository);
  }

  @Test
    // Test case 3: Lấy reminder với schoolOwner không có school
  void getRemindersBySchoolOwner_noSchool() {
    SchoolOwner schoolOwner = new SchoolOwner();
    schoolOwner.setSchool(null);
    Pageable pageable = PageRequest.of(0, 10);

    when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));

    Page<RequestCounsellingVO> result = service.getRemindersBySchoolOwner(1, 10, 1, null);

    assertEquals(0, result.getTotalElements());
    assertEquals(pageable, result.getPageable());
    verify(schoolOwnerRepository).findByUserId(1);
    verifyNoInteractions(requestCounsellingRepository);
  }

  @Test
    // Test case 4: Lấy reminder với statuses cụ thể
  void getRemindersBySchoolOwner_withStatuses() {
    SchoolOwner schoolOwner = new SchoolOwner();
    schoolOwner.setSchool(school);
    Pageable pageable = PageRequest.of(0, 5);
    List<Byte> statuses = Arrays.asList((byte) 0, (byte) 1);
    List<RequestCounselling> requestList = Collections.singletonList(requestCounselling);
    Page<RequestCounselling> requestPage = new PageImpl<>(requestList, pageable, 1);

    when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
    when(requestCounsellingRepository.findBySchoolIdAndStatusIn(eq(1), eq(statuses), eq(pageable))).thenReturn(requestPage);
    when(requestCounsellingMapper.toRequestCounsellingVO(requestCounselling)).thenReturn(requestCounsellingVO);

    Page<RequestCounsellingVO> result = service.getRemindersBySchoolOwner(1, 5, 1, statuses);

    assertEquals(1, result.getTotalElements());
    verify(requestCounsellingRepository).findBySchoolIdAndStatusIn(eq(1), eq(statuses), eq(pageable));
  }

  @Test
    // Test case 5: Lấy reminder không có kết quả
  void getRemindersBySchoolOwner_noResults() {
    SchoolOwner schoolOwner = new SchoolOwner();
    schoolOwner.setSchool(school);
    Pageable pageable = PageRequest.of(0, 10);
    Page<RequestCounselling> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

    when(schoolOwnerRepository.findByUserId(1)).thenReturn(Optional.of(schoolOwner));
    when(requestCounsellingRepository.findBySchoolIdAndStatusIn(eq(1), anyList(), eq(pageable))).thenReturn(emptyPage);

    Page<RequestCounsellingVO> result = service.getRemindersBySchoolOwner(1, 10, 1, null);

    assertEquals(0, result.getTotalElements());
    verify(requestCounsellingRepository).findBySchoolIdAndStatusIn(eq(1), anyList(), eq(pageable));
  }
}