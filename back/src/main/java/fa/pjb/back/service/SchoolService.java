package fa.pjb.back.service;

import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.vo.SchoolVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SchoolService {
    SchoolVO getSchoolInfo(Integer schoolId);

    SchoolVO addSchool(AddSchoolDTO schoolDTO, List<MultipartFile> image);

    void updateSchoolStatus(Integer schoolID, ChangeSchoolStatusDTO changeSchoolStatusDTO);
}
