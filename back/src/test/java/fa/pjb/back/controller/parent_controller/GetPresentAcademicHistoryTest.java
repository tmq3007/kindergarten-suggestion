package fa.pjb.back.controller.parent_controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.controller.ParentController;
import fa.pjb.back.model.vo.ParentInSchoolDetailVO;
import fa.pjb.back.model.vo.SchoolSearchVO;
import fa.pjb.back.service.ParentService;
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
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetPresentAcademicHistoryTest {

    @Mock
    private ParentService parentService;

    @InjectMocks
    private ParentController controller;

    private Page<ParentInSchoolDetailVO> mockPresentPage;

    @BeforeEach
    void setUp() {
        // Khởi tạo dữ liệu mock cho SchoolSearchVO
        SchoolSearchVO schoolSearchVO = SchoolSearchVO.builder()
                .id(1)
                .name("School A")
                .build();

        // Khởi tạo dữ liệu mock cho ParentInSchoolDetailVO (Present)
        ParentInSchoolDetailVO presentVO = ParentInSchoolDetailVO.builder()
                .id(1)
                .school(schoolSearchVO)
                .fromDate(LocalDate.of(2024, 1, 1))
                .toDate(null) // null để biểu thị hiện tại
                .status((byte) 1) // Giả định 1 là "Enrolled"
                .totalSchoolReview(10)
                .averageSchoolRating(4.2)
                .providedRating(4.0)
                .comment("Great school!")
                .hasEditCommentPermission(true)
                .build();

        mockPresentPage = new PageImpl<>(Collections.singletonList(presentVO), PageRequest.of(0, 2), 1);
    }

    @Test
    void testGetPresentAcademicHistory_Success() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);

        when(parentService.getPresentAcademicHistory(page, size)).thenReturn(mockPresentPage);

        // Act
        ApiResponse<Page<ParentInSchoolDetailVO>> response = controller.getPresentAcademicHistory(page, size);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Present academic history retrieved successfully", response.getMessage());
        assertEquals(mockPresentPage, response.getData());
        assertEquals(1, response.getData().getTotalElements());

        ParentInSchoolDetailVO resultVO = response.getData().getContent().get(0);
        assertEquals(1, resultVO.id());
        assertEquals("School A", resultVO.school().name());
        assertEquals(LocalDate.of(2024, 1, 1), resultVO.fromDate());
        assertNull(resultVO.toDate());
        assertEquals((byte) 1, resultVO.status());
        assertEquals(10, resultVO.totalSchoolReview());
        assertEquals(4.2, resultVO.averageSchoolRating(), 0.01);
        assertEquals(4.0, resultVO.providedRating(), 0.01);
        assertEquals("Great school!", resultVO.comment());
        assertTrue(resultVO.hasEditCommentPermission());

        verify(parentService, times(1)).getPresentAcademicHistory(page, size);
    }

    @Test
    void testGetPresentAcademicHistory_EmptyPage() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<ParentInSchoolDetailVO> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(parentService.getPresentAcademicHistory(page, size)).thenReturn(emptyPage);

        // Act
        ApiResponse<Page<ParentInSchoolDetailVO>> response = controller.getPresentAcademicHistory(page, size);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Present academic history retrieved successfully", response.getMessage());
        assertEquals(emptyPage, response.getData());
        assertEquals(0, response.getData().getTotalElements());

        verify(parentService, times(1)).getPresentAcademicHistory(page, size);
    }

    @Test
    void testGetPresentAcademicHistory_ServiceThrowsException() {
        // Arrange
        int page = 1;
        int size = 2;

        when(parentService.getPresentAcademicHistory(page, size)).thenThrow(new RuntimeException("Service error"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> controller.getPresentAcademicHistory(page, size));

        verify(parentService, times(1)).getPresentAcademicHistory(page, size);
    }
}