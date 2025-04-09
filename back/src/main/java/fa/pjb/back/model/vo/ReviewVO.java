package fa.pjb.back.model.vo;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

        LocalDateTime receiveDate,

        String report,

        Byte status

) {
}