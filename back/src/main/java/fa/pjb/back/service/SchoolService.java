package fa.pjb.back.service;

import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.dto.SchoolUpdateDTO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.SchoolListVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SchoolService {
    SchoolDetailVO getSchoolInfo(Integer schoolId);

    Page<SchoolListVO> getAllSchools(String name, String province, String district, String street,
                                     String email, String phone, Pageable pageable);

    Page<SchoolDetailVO> getSchoolsByUserId(Integer userId, Pageable pageable, String name);

    SchoolDetailVO addSchool(AddSchoolDTO schoolDTO, List<MultipartFile> image);

    void updateSchoolStatus(Integer schoolID, ChangeSchoolStatusDTO changeSchoolStatusDTO);

    boolean checkEmailExists(String email);

    boolean checkPhoneExists(String phone);

    SchoolDetailVO updateSchoolByAdmin(SchoolUpdateDTO schoolDTO, List<MultipartFile> images);
}
