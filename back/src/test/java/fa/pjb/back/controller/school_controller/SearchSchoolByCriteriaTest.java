package fa.pjb.back.controller.school_controller;

import fa.pjb.back.controller.SchoolController;
import fa.pjb.back.model.dto.SchoolSearchDTO;
import fa.pjb.back.model.vo.SchoolSearchNativeVO;
import fa.pjb.back.service.SchoolService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SearchSchoolByCriteriaTest {

    private MockMvc mockMvc;

    @Mock
    private SchoolService schoolService;

    @InjectMocks
    private SchoolController schoolController;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(schoolController).build();
    }

    /**
     * Normal Case 1: Search with all parameters
     * Description: Search schools with all possible filter criteria
     * Expected: Returns HTTP 200 OK with filtered results
     */
    @Test
    void searchSchools_WithAllParameters_Success() throws Exception {
        // Prepare mock data
        SchoolSearchNativeVO school1 = createMockSchool(1, "School A", 1, 3, 1000, 2000,
                Arrays.asList(1, 2), Arrays.asList(3, 4), "Province A", "District A", 4.5);
        SchoolSearchNativeVO school2 = createMockSchool(2, "School B", 2, 4, 1500, 2500,
                Arrays.asList(3), Arrays.asList(5), "Province B", "District B", 4.0);

        Page<SchoolSearchNativeVO> mockPage = new PageImpl<>(List.of(school1, school2),
                PageRequest.of(0, 10), 2);

        // Mock service response
        when(schoolService.searchSchoolByCriteriaWithNative(any(SchoolSearchDTO.class)))
                .thenReturn(mockPage);

        // Perform request with all parameters
        mockMvc.perform(get("/school/search-by-criteria")
                        .param("name", "School")
                        .param("type", "1")
                        .param("age", "3")
                        .param("minFee", "1000")
                        .param("maxFee", "3000")
                        .param("facilityIds", "1", "2")
                        .param("utilityIds", "3", "4")
                        .param("province", "Province A")
                        .param("district", "District A")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "rating")
                        .param("sortDirection", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Get search results successfully."))
                .andExpect(jsonPath("$.data.content[0].name").value("School A"))
                .andExpect(jsonPath("$.data.content[0].rating").value(4.5))
                .andExpect(jsonPath("$.data.content[1].name").value("School B"))
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    /**
     * Normal Case 2: Search with minimal parameters
     * Description: Search schools with only required parameters
     * Expected: Returns HTTP 200 OK with all results
     */
    @Test
    void searchSchools_WithMinimalParameters_Success() throws Exception {
        // Prepare mock data
        SchoolSearchNativeVO school1 = createMockSchool(1, "School A", 1, 3, 1000, 2000,
                List.of(), List.of(), "Province A", "District A", 4.5);

        Page<SchoolSearchNativeVO> mockPage = new PageImpl<>(List.of(school1),
                PageRequest.of(0, 10), 1);

        // Mock service response
        when(schoolService.searchSchoolByCriteriaWithNative(any(SchoolSearchDTO.class)))
                .thenReturn(mockPage);

        // Perform request with minimal parameters
        mockMvc.perform(get("/school/search-by-criteria")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("School A"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    /**
     * Boundary Case 1: Search with maximum pagination values
     * Description: Test with maximum page size
     * Expected: Returns HTTP 200 OK with results
     */
    @Test
    void searchSchools_WithMaxPageSize_Success() throws Exception {
        // Prepare mock data
        SchoolSearchNativeVO school = createMockSchool(1, "Large Result School", 1, 3,
                1000, 2000, List.of(), List.of(), "Province", "District", 4.0);

        Page<SchoolSearchNativeVO> mockPage = new PageImpl<>(List.of(school),
                PageRequest.of(0, Integer.MAX_VALUE), 1);

        // Mock service response
        when(schoolService.searchSchoolByCriteriaWithNative(any(SchoolSearchDTO.class)))
                .thenReturn(mockPage);

        // Perform request with max page size
        mockMvc.perform(get("/school/search-by-criteria")
                        .param("page", "0")
                        .param("size", String.valueOf(Integer.MAX_VALUE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Large Result School"));
    }

    /**
     * Boundary Case 2: Search with empty result
     * Description: Test when no schools match the criteria
     * Expected: Returns HTTP 200 OK with empty content
     */
    @Test
    void searchSchools_EmptyResult_Success() throws Exception {
        // Prepare empty mock data
        Page<SchoolSearchNativeVO> mockPage = new PageImpl<>(List.of(),
                PageRequest.of(0, 10), 0);

        // Mock service response
        when(schoolService.searchSchoolByCriteriaWithNative(any(SchoolSearchDTO.class)))
                .thenReturn(mockPage);

        // Perform request with specific criteria that returns no results
        mockMvc.perform(get("/school/search-by-criteria")
                        .param("name", "Non-existent School")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isEmpty())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    /**
     * Boundary Case 3: Search with extreme fee values
     * Description: Test with very high and very low fee ranges
     * Expected: Returns HTTP 200 OK with appropriate results
     */
    @Test
    void searchSchools_WithExtremeFeeValues_Success() throws Exception {
        // Prepare mock data
        SchoolSearchNativeVO school = createMockSchool(1, "Expensive School", 1, 3,
                1000000, 2000000, List.of(), List.of(), "Province", "District", 4.0);

        Page<SchoolSearchNativeVO> mockPage = new PageImpl<>(List.of(school),
                PageRequest.of(0, 10), 1);

        // Mock service response
        when(schoolService.searchSchoolByCriteriaWithNative(any(SchoolSearchDTO.class)))
                .thenReturn(mockPage);

        // Perform request with extreme fee values
        mockMvc.perform(get("/school/search-by-criteria")
                        .param("minFee", "1000000")
                        .param("maxFee", "2000000")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Expensive School"))
                .andExpect(jsonPath("$.data.content[0].feeFrom").value(1000000));
    }

    /**
     * Boundary Case 4: Search with special characters in name
     * Description: Test with special characters in school name
     * Expected: Returns HTTP 200 OK with filtered results
     */
    @Test
    void searchSchools_WithSpecialCharactersInName_Success() throws Exception {
        // Prepare mock data
        SchoolSearchNativeVO school = createMockSchool(1, "School @#$%", 1, 3,
                1000, 2000, List.of(), List.of(), "Province", "District", 4.0);

        Page<SchoolSearchNativeVO> mockPage = new PageImpl<>(List.of(school),
                PageRequest.of(0, 10), 1);

        // Mock service response
        when(schoolService.searchSchoolByCriteriaWithNative(any(SchoolSearchDTO.class)))
                .thenReturn(mockPage);

        // Perform request with special characters
        mockMvc.perform(get("/school/search-by-criteria")
                        .param("name", "@#$%")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("School @#$%"));
    }

    /**
     * Boundary Case 5: Search with multiple facilities and utilities
     * Description: Test with multiple facility and utility IDs
     * Expected: Returns HTTP 200 OK with schools that have all specified facilities/utilities
     */
    @Test
    void searchSchools_WithMultipleFacilitiesAndUtilities_Success() throws Exception {
        // Prepare mock data
        SchoolSearchNativeVO school = createMockSchool(1, "Well-Equipped School", 1, 3,
                1000, 2000, Arrays.asList(1, 2, 3, 4), Arrays.asList(5, 6, 7), "Province", "District", 5.0);

        Page<SchoolSearchNativeVO> mockPage = new PageImpl<>(List.of(school),
                PageRequest.of(0, 10), 1);

        // Mock service response
        when(schoolService.searchSchoolByCriteriaWithNative(any(SchoolSearchDTO.class)))
                .thenReturn(mockPage);

        // Perform request with multiple facilities and utilities
        mockMvc.perform(get("/school/search-by-criteria")
                        .param("facilityIds", "1", "2", "3", "4")
                        .param("utilityIds", "5", "6", "7")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Well-Equipped School"))
                .andExpect(jsonPath("$.data.content[0].facilities.length()").value(4))
                .andExpect(jsonPath("$.data.content[0].utilities.length()").value(3));
    }

    /**
     * Boundary Case 6: Search with sorting by different fields
     * Description: Test sorting by various fields in both directions
     * Expected: Returns HTTP 200 OK with properly sorted results
     */
    @Test
    void searchSchools_WithDifferentSortingOptions_Success() throws Exception {
        // Test sorting by rating desc (higher rating first)
        testSorting("rating", "desc", 5.0, 4.0);

        // Test sorting by rating asc (lower rating first)
        testSorting("rating", "asc", 4.0, 5.0);

        // Test sorting by postedDate desc (newer first)
        testSorting("postedDate", "desc", null, null);

        // Test sorting by postedDate asc (older first)
        testSorting("postedDate", "asc", null, null);

        // Test sorting by feeFrom desc (higher fee first)
        testSorting("feeFrom", "desc", 2000, 1000);

        // Test sorting by feeFrom asc (lower fee first)
        testSorting("feeFrom", "asc", 1000, 2000);
    }

    private void testSorting(String sortBy, String sortDirection, Object firstValue, Object secondValue) throws Exception {
        // Prepare mock data
        LocalDateTime now = LocalDateTime.now();
        SchoolSearchNativeVO school1 = createMockSchool(1, "School A", 1, 3, 1000, 2000,
                List.of(), List.of(), "Province", "District", 4.0);
        SchoolSearchNativeVO school2 = createMockSchool(2, "School B", 1, 3, 2000, 3000,
                List.of(), List.of(), "Province", "District", 5.0);

        // Adjust mock data based on sort field
        if (sortBy.equals("rating")) {
            school1.setRating(4.0);
            school2.setRating(5.0);
        } else if (sortBy.equals("feeFrom")) {
            school1.setFeeFrom(1000);
            school2.setFeeFrom(2000);
        } else if (sortBy.equals("postedDate")) {
            school1.setPostedDate(now.minusDays(1));
            school2.setPostedDate(now);
        }

        Page<SchoolSearchNativeVO> mockPage = new PageImpl<>(
                sortDirection.equals("desc") ? List.of(school2, school1) : List.of(school1, school2),
                PageRequest.of(0, 10, Sort.by(Sort.Direction.fromString(sortDirection), sortBy)),
                2);

        // Mock service response
        when(schoolService.searchSchoolByCriteriaWithNative(any(SchoolSearchDTO.class)))
                .thenReturn(mockPage);

        // Perform request with sorting
        ResultActions result = mockMvc.perform(get("/school/search-by-criteria")
                        .param("sortBy", sortBy)
                        .param("sortDirection", sortDirection)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());

        // Handle different assertion types based on sort field
        if (sortBy.equals("rating")) {
            result.andExpect(jsonPath("$.data.content[0].rating").value(firstValue))
                    .andExpect(jsonPath("$.data.content[1].rating").value(secondValue));
        } else if (sortBy.equals("feeFrom")) {
            result.andExpect(jsonPath("$.data.content[0].feeFrom").value(firstValue))
                    .andExpect(jsonPath("$.data.content[1].feeFrom").value(secondValue));
        } else if (sortBy.equals("postedDate")) {
            // For dates, we just verify the order since exact timestamps might vary
            ((ResultActions) result).andExpect(jsonPath("$.data.content[0].name").value(
                            sortDirection.equals("desc") ? "School B" : "School A"))
                    .andExpect(jsonPath("$.data.content[1].name").value(
                            sortDirection.equals("desc") ? "School A" : "School B"));
        }
    }

    private String getSortFieldPath(String sortBy) {
        switch (sortBy) {
            case "rating": return "rating";
            case "feeFrom": return "feeFrom";
            case "postedDate": return "postedDate";
            default: return "rating";
        }
    }

    // Helper method to create mock SchoolSearchNativeVO objects
    private SchoolSearchNativeVO createMockSchool(int id, String name, int type, int age,
                                                  int feeFrom, int feeTo, List<Integer> facilities, List<Integer> utilities,
                                                  String province, String district, double rating) {
        SchoolSearchNativeVO school = new SchoolSearchNativeVO(new Object[]{
                id, name, type, district, "Ward", province, "Street",
                "email@school.com", "+123456789", age, 1, feeFrom, feeTo,
                "https://website.com", "Description", java.sql.Timestamp.valueOf(LocalDateTime.now()),
                rating,
                facilities.stream().map(String::valueOf).collect(Collectors.joining(",")),
                utilities.stream().map(String::valueOf).collect(Collectors.joining(","))
        });
        return school;
    }
}