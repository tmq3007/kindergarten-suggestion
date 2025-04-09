package fa.pjb.back.model.mapper;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ParentProjection {
    Integer getId();
    Boolean getStatus();
    String getDistrict();
    String getWard();
    String getProvince();
    String getStreet();
    Integer getUserId();
    String getUsername();
    String getFullname();
    String getEmail();
    String getRole();
    Byte getUserEnrollStatus();
    String getPhone();
    LocalDate getDob();
    Integer getPisId();
    String getMediaId();
    String getMediaUrl();
    LocalDate getFromDate();
    LocalDate getToDate();
}
