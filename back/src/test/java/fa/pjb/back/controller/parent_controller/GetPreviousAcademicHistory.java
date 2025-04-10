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
class GetPreviousAcademicHistory {

    @Mock
    private ParentService parentService;

    @InjectMocks
    private ParentController controller;

    private Page<ParentInSchoolDetailVO> mockPreviousPage;

    @BeforeEach
    void setUp() {
        // Khởi tạo dữ liệu mock cho SchoolSearchVO
        SchoolSearchVO schoolSearchVO = SchoolSearchVO.builder()
                .id(1)
                .name("School A")
                .build();

        // Khởi tạo dữ liệu mock cho ParentInSchoolDetailVO (Previous)
        ParentInSchoolDetailVO previousVO = ParentInSchoolDetailVO.builder()
                .id(2)
                .school(schoolSearchVO)
                .fromDate(LocalDate.of(2023, 1, 1))
                .toDate(LocalDate.of(2023, 12, 31)) // Có ngày kết thúc để biểu thị quá khứ
                .status((byte) 0) // Giả định 0 là "Unenrolled"
                .totalSchoolReview(8)
                .averageSchoolRating(4.0)
                .providedRating(3.5)
                .comment("Good experience")
                .hasEditCommentPermission(false)
                .build();

        mockPreviousPage = new PageImpl<>(Collections.singletonList(previousVO), PageRequest.of(0, 2), 1);
    }

    @Test
    void testGetPreviousAcademicHistory_Success() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);

        when(parentService.getPreviousAcademicHistory(page, size)).thenReturn(mockPreviousPage);

        // Act
        ApiResponse<Page<ParentInSchoolDetailVO>> response = controller.getPreviousAcademicHistory(page, size);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Previous academic history retrieved successfully", response.getMessage());
        assertEquals(mockPreviousPage, response.getData());
        assertEquals(1, response.getData().getTotalElements());

        ParentInSchoolDetailVO resultVO = response.getData().getContent().get(0);
        assertEquals(2, resultVO.id());
        assertEquals("School A", resultVO.school().name());
        assertEquals(LocalDate.of(2023, 1, 1), resultVO.fromDate());
        assertEquals(LocalDate.of(2023, 12, 31), resultVO.toDate());
        assertEquals((byte) 0, resultVO.status());
        assertEquals(8, resultVO.totalSchoolReview());
        assertEquals(4.0, resultVO.averageSchoolRating(), 0.01);
        assertEquals(3.5, resultVO.providedRating(), 0.01);
        assertEquals("Good experience", resultVO.comment());
        assertFalse(resultVO.hasEditCommentPermission());

        verify(parentService, times(1)).getPreviousAcademicHistory(page, size);
    }

    @Test
    void testGetPreviousAcademicHistory_EmptyPage() {
        // Arrange
        int page = 1;
        int size = 2;
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<ParentInSchoolDetailVO> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(parentService.getPreviousAcademicHistory(page, size)).thenReturn(emptyPage);

        // Act
        ApiResponse<Page<ParentInSchoolDetailVO>> response = controller.getPreviousAcademicHistory(page, size);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getCode());
        assertEquals("Previous academic history retrieved successfully", response.getMessage());
        assertEquals(emptyPage, response.getData());
        assertEquals(0, response.getData().getTotalElements());

        verify(parentService, times(1)).getPreviousAcademicHistory(page, size);
    }

    @Test
    void testGetPreviousAcademicHistory_ServiceThrowsException() {
        // Arrange
        int page = 1;
        int size = 2;

        when(parentService.getPreviousAcademicHistory(page, size)).thenThrow(new RuntimeException("Service error"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> controller.getPreviousAcademicHistory(page, size));

        verify(parentService, times(1)).getPreviousAcademicHistory(page, size);
    }
}
