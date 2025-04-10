package fa.pjb.back.service.school_service;

import fa.pjb.back.model.dto.SchoolSearchDTO;
import fa.pjb.back.model.vo.SchoolSearchNativeVO;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.impl.SchoolServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchSchoolByCriteriaTest {

    @Mock
    private SchoolRepository schoolRepository;

    @InjectMocks
    private SchoolServiceImpl schoolService;

    private SchoolSearchDTO basicSearchDTO;
    private SchoolSearchDTO facilitySearchDTO;
    private SchoolSearchDTO utilitySearchDTO;
    private SchoolSearchDTO combinedSearchDTO;

    @BeforeEach
    void setUp() {
        // Basic search DTO (no facilities/utilities)
        basicSearchDTO = SchoolSearchDTO.builder()
                .name("Test School")
                .type((byte) 1)
                .age((byte) 3)
                .minFee(1000L)
                .maxFee(2000L)
                .province("Test Province")
                .district("Test District")
                .page(0)
                .size(10)
                .sortBy("rating")
                .sortDirection("desc")
                .build();

        // Search with facilities
        facilitySearchDTO = SchoolSearchDTO.builder()
                .name("Test School")
                .facilityIds(Arrays.asList(1, 2))
                .page(0)
                .size(10)
                .build();

        // Search with utilities
        utilitySearchDTO = SchoolSearchDTO.builder()
                .name("Test School")
                .utilityIds(Arrays.asList(3, 4))
                .page(0)
                .size(10)
                .build();

        // Combined search with both facilities and utilities
        combinedSearchDTO = SchoolSearchDTO.builder()
                .name("Test School")
                .facilityIds(Arrays.asList(1, 2))
                .utilityIds(Arrays.asList(3, 4))
                .page(0)
                .size(10)
                .build();
    }

    @Test
    void searchSchoolByCriteriaWithNative_BasicSearch_ReturnsPaginatedResults() {
        // Arrange
        Object[] mockRow = createMockSchoolRow(1, "Test School", 1, 3, 1000, 2000,
                "1,2", "3,4", "Test Province", "Test District", 4.5);

        when(schoolRepository.searchSchoolsBasicRaw(
                eq("Test School"), eq((byte)1), eq((byte)3), eq(1000L), eq(2000L),
                eq("Test Province"), eq("Test District"), eq("rating"), eq("desc"),
                eq(10), eq(0)))
                .thenReturn(Collections.singletonList(mockRow));

        when(schoolRepository.countSchoolsBasic(
                eq("Test School"), eq((byte)1), eq((byte)3), eq(1000L), eq(2000L),
                eq("Test Province"), eq("Test District")))
                .thenReturn(1L);

        // Act
        Page<SchoolSearchNativeVO> result = schoolService.searchSchoolByCriteriaWithNative(basicSearchDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());

        SchoolSearchNativeVO school = result.getContent().get(0);
        assertEquals("Test School", school.getName());
        assertEquals(4.5, school.getRating());
        assertEquals(2, school.getFacilities().size());
        assertEquals(2, school.getUtilities().size());
    }

    @Test
    void searchSchoolByCriteriaWithNative_FacilitySearch_ReturnsFilteredResults() {
        // Arrange
        Object[] mockRow = createMockSchoolRow(1, "Test School", 1, 3, 1000, 2000,
                "1,2", "3,4", "Test Province", "Test District", 4.5);

        when(schoolRepository.searchSchoolsWithFacilityAndUtilityRaw(
                eq("Test School"), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), eq(Arrays.asList(1, 2)), isNull(),
                eq(2), eq(0), isNull(), isNull(),
                eq(10), eq(0)))
                .thenReturn(Collections.singletonList(mockRow));

        when(schoolRepository.countSchoolsWithFacilityAndUtility(
                eq("Test School"), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), eq(Arrays.asList(1, 2)), isNull(),
                eq(2), eq(0)))
                .thenReturn(1L);

        // Act
        Page<SchoolSearchNativeVO> result = schoolService.searchSchoolByCriteriaWithNative(facilitySearchDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());

        SchoolSearchNativeVO school = result.getContent().get(0);
        assertEquals("Test School", school.getName());
        assertTrue(school.getFacilities().containsAll(Arrays.asList(1, 2)));
    }

    @Test
    void searchSchoolByCriteriaWithNative_UtilitySearch_ReturnsFilteredResults() {
        // Arrange
        Object[] mockRow = createMockSchoolRow(1, "Test School", 1, 3, 1000, 2000,
                "1,2", "3,4", "Test Province", "Test District", 4.5);

        when(schoolRepository.searchSchoolsWithFacilityAndUtilityRaw(
                eq("Test School"), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), eq(Arrays.asList(3, 4)),
                eq(0), eq(2), isNull(), isNull(),
                eq(10), eq(0)))
                .thenReturn(Collections.singletonList(mockRow));

        when(schoolRepository.countSchoolsWithFacilityAndUtility(
                eq("Test School"), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), eq(Arrays.asList(3, 4)),
                eq(0), eq(2)))
                .thenReturn(1L);

        // Act
        Page<SchoolSearchNativeVO> result = schoolService.searchSchoolByCriteriaWithNative(utilitySearchDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());

        SchoolSearchNativeVO school = result.getContent().get(0);
        assertEquals("Test School", school.getName());
        assertTrue(school.getUtilities().containsAll(Arrays.asList(3, 4)));
    }

    @Test
    void searchSchoolByCriteriaWithNative_CombinedSearch_ReturnsFilteredResults() {
        // Arrange
        Object[] mockRow = createMockSchoolRow(1, "Test School", 1, 3, 1000, 2000,
                "1,2", "3,4", "Test Province", "Test District", 4.5);

        when(schoolRepository.searchSchoolsWithFacilityAndUtilityRaw(
                eq("Test School"), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), eq(Arrays.asList(1, 2)), eq(Arrays.asList(3, 4)),
                eq(2), eq(2), isNull(), isNull(),
                eq(10), eq(0)))
                .thenReturn(Collections.singletonList(mockRow));

        when(schoolRepository.countSchoolsWithFacilityAndUtility(
                eq("Test School"), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), eq(Arrays.asList(1, 2)), eq(Arrays.asList(3, 4)),
                eq(2), eq(2)))
                .thenReturn(1L);

        // Act
        Page<SchoolSearchNativeVO> result = schoolService.searchSchoolByCriteriaWithNative(combinedSearchDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());

        SchoolSearchNativeVO school = result.getContent().get(0);
        assertEquals("Test School", school.getName());
        assertTrue(school.getFacilities().containsAll(Arrays.asList(1, 2)));
        assertTrue(school.getUtilities().containsAll(Arrays.asList(3, 4)));
    }

    @Test
    void searchSchoolByCriteriaWithNative_EmptyResult_ReturnsEmptyPage() {
        // Arrange
        when(schoolRepository.searchSchoolsBasicRaw(
                eq("Test School"), eq((byte)1), eq((byte)3), eq(1000L), eq(2000L),
                eq("Test Province"), eq("Test District"), eq("rating"), eq("desc"),
                eq(10), eq(0)))
                .thenReturn(Collections.emptyList());

        when(schoolRepository.countSchoolsBasic(
                eq("Test School"), eq((byte)1), eq((byte)3), eq(1000L), eq(2000L),
                eq("Test Province"), eq("Test District")))
                .thenReturn(0L);

        // Act
        Page<SchoolSearchNativeVO> result = schoolService.searchSchoolByCriteriaWithNative(basicSearchDTO);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }

    @Test
    void searchSchoolByCriteriaWithNative_NullParameters_ReturnsAllResults() {
        // Arrange
        SchoolSearchDTO nullParamsDTO = SchoolSearchDTO.builder()
                .page(0)
                .size(10)
                .build();

        Object[] mockRow1 = createMockSchoolRow(1, "School A", 1, 3, 1000, 2000,
                "1", "3", "Province A", "District A", 4.0);
        Object[] mockRow2 = createMockSchoolRow(2, "School B", 2, 4, 1500, 2500,
                "2", "4", "Province B", "District B", 4.5);

        when(schoolRepository.searchSchoolsBasicRaw(
                isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), isNull(),
                eq(10), eq(0)))
                .thenReturn(Arrays.asList(mockRow1, mockRow2));

        when(schoolRepository.countSchoolsBasic(
                isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull()))
                .thenReturn(2L);

        // Act
        Page<SchoolSearchNativeVO> result = schoolService.searchSchoolByCriteriaWithNative(nullParamsDTO);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());
    }

    @Test
    void searchSchoolByCriteriaWithNative_SortingOptions_ReturnsProperlySortedResults() {
        // Arrange
        Object[] highRatedRow = createMockSchoolRow(1, "High Rated School", 1, 3, 1000, 2000,
                "1", "3", "Province", "District", 5.0);
        Object[] lowRatedRow = createMockSchoolRow(2, "Low Rated School", 1, 3, 1000, 2000,
                "1", "3", "Province", "District", 3.0);

        // Test rating desc
        when(schoolRepository.searchSchoolsBasicRaw(
                isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), eq("rating"), eq("desc"),
                eq(10), eq(0)))
                .thenReturn(Arrays.asList(highRatedRow, lowRatedRow));

        // Test rating asc
        when(schoolRepository.searchSchoolsBasicRaw(
                isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), eq("rating"), eq("asc"),
                eq(10), eq(0)))
                .thenReturn(Arrays.asList(lowRatedRow, highRatedRow));

        when(schoolRepository.countSchoolsBasic(
                isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull()))
                .thenReturn(2L);

        // Test desc sort
        SchoolSearchDTO descSortDTO = SchoolSearchDTO.builder()
                .sortBy("rating")
                .sortDirection("desc")
                .page(0)
                .size(10)
                .build();

        Page<SchoolSearchNativeVO> descResult = schoolService.searchSchoolByCriteriaWithNative(descSortDTO);
        assertEquals(5.0, descResult.getContent().get(0).getRating());
        assertEquals(3.0, descResult.getContent().get(1).getRating());

        // Test asc sort
        SchoolSearchDTO ascSortDTO = SchoolSearchDTO.builder()
                .sortBy("rating")
                .sortDirection("asc")
                .page(0)
                .size(10)
                .build();

        Page<SchoolSearchNativeVO> ascResult = schoolService.searchSchoolByCriteriaWithNative(ascSortDTO);
        assertEquals(3.0, ascResult.getContent().get(0).getRating());
        assertEquals(5.0, ascResult.getContent().get(1).getRating());
    }

    // Helper method to create mock school row data
    private Object[] createMockSchoolRow(int id, String name, int type, int age,
                                         int feeFrom, int feeTo, String facilities, String utilities,
                                         String province, String district, double rating) {
        return new Object[]{
                id, name, type, district, "Ward", province, "Street",
                "email@school.com", "+123456789", age, 1, feeFrom, feeTo,
                "https://website.com", "Description", Timestamp.valueOf(LocalDateTime.now()),
                rating,
                facilities,
                utilities
        };
    }
}