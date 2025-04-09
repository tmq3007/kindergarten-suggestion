package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record ReviewDTO(
        Integer id,
        @NotNull
        Integer schoolId,
        @NotNull
        Integer userId,
        @NotNull
        Byte learningProgram,
        @NotNull
        Byte facilitiesAndUtilities,
        @NotNull
        Byte extracurricularActivities,
        @NotNull
        Byte teacherAndStaff,
        @NotNull
        Byte hygieneAndNutrition,
        String feedback
) {
}