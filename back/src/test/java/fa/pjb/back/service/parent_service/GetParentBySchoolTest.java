package fa.pjb.back.service.parent_service;

import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.InvalidDataException;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.mapper.ParentProjection;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.SchoolOwnerRepository;
import fa.pjb.back.service.impl.ParentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GetParentBySchoolTest {

    @Mock
    private ParentRepository parentRepository;

    @Mock
    private SchoolOwnerRepository schoolOwnerRepository;

    @Mock
    private ParentMapper parentMapper;

    @InjectMocks
    private ParentServiceImpl parentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldThrowInvalidDataExceptionWhenSearchByIsInvalid() {
        User user = new User();
        user.setId(1);

        String invalidSearchBy = "invalidField";
        int page = 1;
        int size = 10;
        String keyword = "test";

        assertThrows(InvalidDataException.class, () -> parentService.getParentBySchool(page, size, invalidSearchBy, keyword));
    }

    @Test
    void shouldThrowSchoolNotFoundExceptionWhenUserIsNotAssociatedWithAnySchool() {
        User user = new User();
        user.setId(1);

        int page = 1;
        int size = 10;
        String searchBy = "username";
        String keyword = "test";

        when(schoolOwnerRepository.findByUserId(user.getId())).thenReturn(Optional.empty());

        assertThrows(SchoolNotFoundException.class, () -> parentService.getParentBySchool( page, size, searchBy, keyword));
    }


    @Test
    void shouldReturnPageOfParentVOWhenValidSearchByAndKeywordProvided() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1);

        int page = 1;
        int size = 10;
        String searchBy = "username";
        String keyword = "test";

        SchoolOwner schoolOwner = mock(SchoolOwner.class);
        School school = mock(School.class);
        when(school.getId()).thenReturn(1);
        when(schoolOwner.getSchool()).thenReturn(school);

        ParentProjection parentProjection = mock(ParentProjection.class);

        Page<ParentProjection> parentProjections = new PageImpl<>(List.of(parentProjection));

        ParentVO parentVO = mock(ParentVO.class);

        when(schoolOwnerRepository.findByUserId(user.getId())).thenReturn(Optional.of(schoolOwner));
        when(parentRepository.findActiveParentsInSchoolWithFilters(school.getId(), searchBy, keyword, PageRequest.of(page - 1, size)))
                .thenReturn(parentProjections);
        when(parentMapper.toParentVOFromProjection(parentProjection)).thenReturn(parentVO);

        Page<ParentVO> result = parentService.getParentBySchool( page, size, searchBy, keyword);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(parentVO, result.getContent().get(0));
    }

    @Test
    void shouldCorrectlyMapParentProjectionToParentVOForEachParentInResult() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1);

        int page = 1;
        int size = 10;
        String searchBy = "username";
        String keyword = "test";

        SchoolOwner schoolOwner = mock(SchoolOwner.class);
        School school = mock(School.class);
        when(school.getId()).thenReturn(1);
        when(schoolOwner.getSchool()).thenReturn(school);

        ParentProjection parentProjection1 = mock(ParentProjection.class);
        ParentProjection parentProjection2 = mock(ParentProjection.class);

        Page<ParentProjection> parentProjections = new PageImpl<>(List.of(parentProjection1, parentProjection2));

        ParentVO parentVO1 = mock(ParentVO.class);
        ParentVO parentVO2 = mock(ParentVO.class);

        when(schoolOwnerRepository.findByUserId(user.getId())).thenReturn(Optional.of(schoolOwner));
        when(parentRepository.findActiveParentsInSchoolWithFilters(school.getId(), searchBy, keyword, PageRequest.of(page - 1, size)))
                .thenReturn(parentProjections);
        when(parentMapper.toParentVOFromProjection(parentProjection1)).thenReturn(parentVO1);
        when(parentMapper.toParentVOFromProjection(parentProjection2)).thenReturn(parentVO2);

        Page<ParentVO> result = parentService.getParentBySchool( page, size, searchBy, keyword);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(parentVO1, result.getContent().get(0));
        assertEquals(parentVO2, result.getContent().get(1));
    }

    @Test
    void shouldReturnEmptyPageWhenNoParentsMatchSearchCriteria() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1);

        int page = 1;
        int size = 10;
        String searchBy = "username";
        String keyword = "nonexistent";

        SchoolOwner schoolOwner = mock(SchoolOwner.class);
        School school = mock(School.class);
        when(school.getId()).thenReturn(1);
        when(schoolOwner.getSchool()).thenReturn(school);

        Page<ParentProjection> parentProjections = new PageImpl<>(List.of());

        when(schoolOwnerRepository.findByUserId(user.getId())).thenReturn(Optional.of(schoolOwner));
        when(parentRepository.findActiveParentsInSchoolWithFilters(school.getId(), searchBy, keyword, PageRequest.of(page - 1, size)))
                .thenReturn(parentProjections);

        Page<ParentVO> result = parentService.getParentBySchool( page, size, searchBy, keyword);

        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
    }

    @Test
    void shouldHandlePaginationCorrectlyWhenPageNumberIsGreaterThanAvailablePages() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1);

        int page = 10; // Assuming there are less than 10 pages available
        int size = 10;
        String searchBy = "username";
        String keyword = "test";

        SchoolOwner schoolOwner = mock(SchoolOwner.class);
        School school = mock(School.class);
        when(school.getId()).thenReturn(1);
        when(schoolOwner.getSchool()).thenReturn(school);

        Page<ParentProjection> parentProjections = new PageImpl<>(List.of()); // Empty list for pages beyond available data

        when(schoolOwnerRepository.findByUserId(user.getId())).thenReturn(Optional.of(schoolOwner));
        when(parentRepository.findActiveParentsInSchoolWithFilters(school.getId(), searchBy, keyword, PageRequest.of(page - 1, size)))
                .thenReturn(parentProjections);

        Page<ParentVO> result = parentService.getParentBySchool( page, size, searchBy, keyword);

        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }

    @Test
    void shouldReturnFirstPageOfResultsWhenPageNumberIsOne() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1);

        int page = 1;
        int size = 10;
        String searchBy = "username";
        String keyword = "test";

        SchoolOwner schoolOwner = mock(SchoolOwner.class);
        School school = mock(School.class);
        when(school.getId()).thenReturn(1);
        when(schoolOwner.getSchool()).thenReturn(school);

        ParentProjection parentProjection1 = mock(ParentProjection.class);
        ParentProjection parentProjection2 = mock(ParentProjection.class);

        Page<ParentProjection> parentProjections = new PageImpl<>(List.of(parentProjection1, parentProjection2));

        ParentVO parentVO1 = mock(ParentVO.class);
        ParentVO parentVO2 = mock(ParentVO.class);

        when(schoolOwnerRepository.findByUserId(user.getId())).thenReturn(Optional.of(schoolOwner));
        when(parentRepository.findActiveParentsInSchoolWithFilters(school.getId(), searchBy, keyword, PageRequest.of(page - 1, size)))
                .thenReturn(parentProjections);
        when(parentMapper.toParentVOFromProjection(parentProjection1)).thenReturn(parentVO1);
        when(parentMapper.toParentVOFromProjection(parentProjection2)).thenReturn(parentVO2);

        Page<ParentVO> result = parentService.getParentBySchool( page, size, searchBy, keyword);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(parentVO1, result.getContent().get(0));
        assertEquals(parentVO2, result.getContent().get(1));
    }


    @Test
    void shouldCorrectlyApplyFiltersWhenSearchByIsEmailAndKeywordIsPartialMatch() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1);

        int page = 1;
        int size = 10;
        String searchBy = "email";
        String keyword = "example";

        SchoolOwner schoolOwner = mock(SchoolOwner.class);
        School school = mock(School.class);
        when(school.getId()).thenReturn(1);
        when(schoolOwner.getSchool()).thenReturn(school);

        ParentProjection parentProjection1 = mock(ParentProjection.class);
        ParentProjection parentProjection2 = mock(ParentProjection.class);

        Page<ParentProjection> parentProjections = new PageImpl<>(List.of(parentProjection1, parentProjection2));

        ParentVO parentVO1 = mock(ParentVO.class);
        ParentVO parentVO2 = mock(ParentVO.class);

        when(schoolOwnerRepository.findByUserId(user.getId())).thenReturn(Optional.of(schoolOwner));
        when(parentRepository.findActiveParentsInSchoolWithFilters(school.getId(), searchBy, keyword, PageRequest.of(page - 1, size)))
                .thenReturn(parentProjections);
        when(parentMapper.toParentVOFromProjection(parentProjection1)).thenReturn(parentVO1);
        when(parentMapper.toParentVOFromProjection(parentProjection2)).thenReturn(parentVO2);

        Page<ParentVO> result = parentService.getParentBySchool( page, size, searchBy, keyword);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(parentVO1, result.getContent().get(0));
        assertEquals(parentVO2, result.getContent().get(1));
    }
}
