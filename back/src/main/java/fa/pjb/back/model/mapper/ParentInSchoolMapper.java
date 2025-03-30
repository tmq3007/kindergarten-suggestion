package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.ParentInSchool;
import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.vo.ParentInSchoolVO;
import fa.pjb.back.model.vo.SchoolListVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ParentInSchoolMapper {
    // Map ParentInSchool and related entities to ParentInSchoolVO
    @Mapping(target = "id", source = "pis.id")
    @Mapping(target = "school", source = "school", qualifiedByName = "toSchoolListVO")
    @Mapping(target = "fromDate", source = "pis.from")
    @Mapping(target = "toDate", source = "pis.to")
    @Mapping(target = "status", source = "pis.status")
    @Mapping(target = "providedRating", source = "review", qualifiedByName = "toProvidedRating")
    @Mapping(target = "comment", source = "review.feedback")
    @Mapping(target = "parent", ignore = true)
    ParentInSchoolVO toParentInSchoolVOAcademicHistory(ParentInSchool pis, School school, Review review);

    // Map School to SchoolListVO
    @Named("toSchoolListVO")
    @Mapping(target = "postedDate", expression = "java(school.getPostedDate().toLocalDate())")
    SchoolListVO toSchoolListVO(School school);

    // Calculate average rating from Review
    @Named("toProvidedRating")
    default Double toProvidedRating(Review review) {
        if (review == null) {
            return null;
        }
        return (review.getLearningProgram() +
                review.getFacilitiesAndUtilities() +
                review.getExtracurricularActivities() +
                review.getTeacherAndStaff() +
                review.getHygieneAndNutrition()) / 5.0;
    }
}
