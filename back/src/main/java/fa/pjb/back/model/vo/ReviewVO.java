package fa.pjb.back.model.vo;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record ReviewVO(
        Integer id,
        Integer schoolId,
        String schoolName,
        Integer parentId,
        String parentName,
        String parentImage,
        Byte learningProgram,
        Byte facilitiesAndUtilities,
        Byte extracurricularActivities,
        Byte teacherAndStaff,
        Byte hygieneAndNutrition,
        String feedback,
       // Integer totalFeedback,
       // Double average,
        LocalDate receiveDate) {
}