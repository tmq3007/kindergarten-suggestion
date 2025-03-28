package fa.pjb.back.model.vo;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
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

        LocalDate receiveDate,

        String report,

        Byte status

) {
}