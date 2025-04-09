package fa.pjb.back.model.mapper;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ReviewProjection {
    Integer getId();
    Integer getSchoolId();
    String getSchoolName();
    Integer getParentId();
    String getParentName();
    String getParentImage();
    Byte getLearningProgram();
    Byte getFacilitiesAndUtilities();
    Byte getExtracurricularActivities();
    Byte getTeacherAndStaff();
    Byte getHygieneAndNutrition();
    String getFeedback();
    LocalDateTime getReceiveDate();
    String getReport();
    Byte getStatus();
}
