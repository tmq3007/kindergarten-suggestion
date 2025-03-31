package fa.pjb.back.service.parent_service;

import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.mapper.ParentProjection;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.service.impl.ParentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GetAllParentTest {

    @Mock
    private ParentRepository parentRepository;

    @Mock
    private ParentMapper parentMapper;

    @InjectMocks
    private ParentServiceImpl parentServiceImpl;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldThrowInvalidDataExceptionWhenSearchByIsAge() {
        // Arrange
        int page = 1;
        int size = 10;
        String searchBy = "age";
        String keyword = "someKeyword";

        // Act & Assert
        assertThrows(InvalidDataException.class, () -> parentServiceImpl.getAllParent(page, size, searchBy, keyword, null));
    }

    @Test
    void shouldThrowInvalidDataExceptionWhenSearchByIsEmptyString() {
        // Arrange
        int page = 1;
        int size = 10;
        String searchBy = "";
        String keyword = "test";

        // Act & Assert
        assertThrows(InvalidDataException.class, () -> parentServiceImpl.getAllParent(page, size, searchBy, keyword, null));
    }

    @Test
    void shouldReturnEmptyPageWhenNoParentsMatchKeyword() {
        // Arrange
        int page = 1;
        int size = 10;
        String searchBy = "fullname";
        String keyword = "nonexistent";
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<ParentProjection> emptyPage = Page.empty(pageable);

        when(parentRepository.findAllParentsWithFilters(null,searchBy, keyword, pageable)).thenReturn(emptyPage);

        // Act
        Page<ParentVO> result = parentServiceImpl.getAllParent(page, size, searchBy, keyword, null);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(parentRepository, times(1)).findAllParentsWithFilters(null,searchBy, keyword, pageable);
    }

    @Test
    void shouldReturnCorrectNumberOfResultsWhenSizeIsSetTo10() {
        // Arrange
        int page = 1;
        int size = 10;
        String searchBy = "username";
        String keyword = "test";

        Pageable pageable = PageRequest.of(page - 1, size);
        List<ParentProjection> parentProjectionsList = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            ParentProjection projection = Mockito.mock(ParentProjection.class);
            parentProjectionsList.add(projection);
        }
        Page<ParentProjection> parentProjections = new PageImpl<>(parentProjectionsList, pageable, size);

        when(parentRepository.findAllParentsWithFilters(null,searchBy, keyword, pageable)).thenReturn(parentProjections);
        when(parentMapper.toParentVOFromProjection(any(ParentProjection.class)))
                .thenReturn(Mockito.mock(ParentVO.class));

        // Act
        Page<ParentVO> result = parentServiceImpl.getAllParent(page, size, searchBy, keyword, null);

        // Assert
        assertNotNull(result);
        assertEquals(size, result.getContent().size());
        verify(parentRepository, times(1)).findAllParentsWithFilters(null,searchBy, keyword, pageable);
    }

    @Test
    void shouldMapParentProjectionToParentVOCorrectlyForValidInputs() {
        // Arrange
        int page = 1;
        int size = 10;
        String searchBy = "email";
        String keyword = "test@example.com";

        Pageable pageable = PageRequest.of(page - 1, size);
        ParentProjection parentProjection = mock(ParentProjection.class);
        ParentVO expectedParentVO = mock(ParentVO.class);

        Page<ParentProjection> parentProjectionsPage = new PageImpl<>(Arrays.asList(parentProjection));

        when(parentRepository.findAllParentsWithFilters(null,searchBy, keyword, pageable)).thenReturn(parentProjectionsPage);
        when(parentMapper.toParentVOFromProjection(parentProjection)).thenReturn(expectedParentVO);

        // Act
        Page<ParentVO> result = parentServiceImpl.getAllParent(page, size, searchBy, keyword, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(expectedParentVO, result.getContent().get(0));
    }

    @Test
    void shouldHandleCaseInsensitiveSearchWhenSearchByIsUsername() {
        // Arrange
        int page = 1;
        int size = 10;
        String searchBy = "username";
        String keyword = "TestUser";
        Pageable pageable = PageRequest.of(page - 1, size);
        Page parentProjections = mock(Page.class);
        ParentProjection parentProjection = mock(ParentProjection.class);
        ParentVO expectedParentVO = mock(ParentVO.class);
        Mockito.when(parentRepository.findAllParentsWithFilters(null,searchBy, keyword, pageable))
                .thenReturn(parentProjections);
        when(parentMapper.toParentVOFromProjection(parentProjection)).thenReturn(expectedParentVO);

        // Act
        Page<ParentVO> result = parentServiceImpl.getAllParent(page, size, searchBy, keyword, null);

        // Assert
        Mockito.verify(parentRepository).findAllParentsWithFilters(null,searchBy, keyword, pageable);
        assertNotNull(result);
    }

    @Test
    void shouldHandleSpecialCharactersInKeywordWithoutErrors() {
        // Arrange
        int page = 1;
        int size = 10;
        String searchBy = "fullname";
        String keyword = "John@Doe#123!";
        Pageable pageable = PageRequest.of(page - 1, size);
        Page parentProjections = mock(Page.class);

        when(parentRepository.findAllParentsWithFilters(null,searchBy, keyword, pageable))
                .thenReturn(parentProjections);

        // Act
        Page<ParentVO> result = parentServiceImpl.getAllParent(page, size, searchBy, keyword, null);

        // Assert
        verify(parentRepository, times(1)).findAllParentsWithFilters(null,searchBy, keyword, pageable);
        assertNotNull(result);
    }

    @Test
    void shouldReturnLastPageOfResultsWhenPageIsSetToMaximumAvailable() {
        // Arrange
        int page = 3; // Assuming there are 3 pages of results
        int size = 10;
        String searchBy = "email";
        String keyword = "example";

        Pageable pageable = PageRequest.of(page - 1, size);
        List<ParentProjection> parentProjectionsList = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            ParentProjection projection = Mockito.mock(ParentProjection.class);
            parentProjectionsList.add(projection);
        }
        Page<ParentProjection> parentProjections = new PageImpl<>(parentProjectionsList, pageable, 30); // Total 30 elements

        when(parentRepository.findAllParentsWithFilters(null,searchBy, keyword, pageable)).thenReturn(parentProjections);
        when(parentMapper.toParentVOFromProjection(any(ParentProjection.class)))
                .thenReturn(Mockito.mock(ParentVO.class));

        // Act
        Page<ParentVO> result = parentServiceImpl.getAllParent(page, size, searchBy, keyword, null);

        // Assert
        assertNotNull(result);
        assertEquals(size, result.getContent().size());
        assertEquals(3, result.getTotalPages());
        verify(parentRepository, times(1)).findAllParentsWithFilters(null,searchBy, keyword, pageable);
    }

    @Test
    void shouldReturnFullPageOfResultsWhenSizeMatchesNumberOfAvailableParents() {
        // Arrange
        int page = 1;
        int size = 10;
        String searchBy = "fullname";
        String keyword = "test";

        Pageable pageable = PageRequest.of(page - 1, size);
        List<ParentProjection> parentProjectionsList = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            ParentProjection projection = Mockito.mock(ParentProjection.class);
            parentProjectionsList.add(projection);
        }
        Page<ParentProjection> parentProjections = new PageImpl<>(parentProjectionsList, pageable, size);

        when(parentRepository.findAllParentsWithFilters(null,searchBy, keyword, pageable)).thenReturn(parentProjections);
        when(parentMapper.toParentVOFromProjection(any(ParentProjection.class)))
                .thenReturn(Mockito.mock(ParentVO.class));

        // Act
        Page<ParentVO> result = parentServiceImpl.getAllParent(page, size, searchBy, keyword, null);

        // Assert
        assertNotNull(result);
        assertEquals(size, result.getContent().size());
        verify(parentRepository, times(1)).findAllParentsWithFilters(null,searchBy, keyword, pageable);
    }
}
