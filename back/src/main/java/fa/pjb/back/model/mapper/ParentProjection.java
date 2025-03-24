package fa.pjb.back.model.mapper;

import java.time.LocalDate;

public interface ParentProjection {
    Integer getId();
    Boolean getStatus();
    String getParentDistrict();
    String getParentWard();
    String getParentProvince();
    String getParentStreet();
    Integer getUserId();
    String getUsername();
    String getFullname();
    String getEmail();
    String getRole();
    Boolean getUserEnrollStatus();
    String getPhone();
    LocalDate getDob();
    String getMediaId();
    String getMediaUrl();
}
