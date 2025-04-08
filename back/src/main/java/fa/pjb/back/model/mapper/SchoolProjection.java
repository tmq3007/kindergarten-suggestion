package fa.pjb.back.model.mapper;

import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;

public interface SchoolProjection {
    Integer getId();
    String getName(); // "schoolname"
    String getStreet();
    String getWard();
    String getDistrict();
    String getProvince();
    String getPhone(); // "PhoneNo"
    String getEmail(); // "Email"
    LocalDateTime getPostedDate(); // "PostedDate"
    Byte getStatus(); // "Status"
}