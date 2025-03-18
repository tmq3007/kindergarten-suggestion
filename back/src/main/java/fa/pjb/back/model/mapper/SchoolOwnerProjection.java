package fa.pjb.back.model.mapper;

import fa.pjb.back.model.vo.MediaVO;

import java.time.LocalDate;
import java.util.List;

public interface SchoolOwnerProjection {
    Integer getId();
    Integer getUserId();
    String getFullname();
    String getUsername();
    String getEmail();
    String getPhone();
    String getExpectedSchool();
    List<MediaVO> getImageList();
    LocalDate getDob();

}

