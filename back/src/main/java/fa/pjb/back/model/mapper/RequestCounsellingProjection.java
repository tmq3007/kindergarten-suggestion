package fa.pjb.back.model.mapper;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;

public interface RequestCounsellingProjection {
  Integer getId();
  String getName();
  String getEmail();
  String getPhone();
  Byte getStatus();
  LocalDateTime getDueDate();
  String getSchoolName();
  String getStreet();
  String getWard();
  String getDistrict();
  String getProvince();
}