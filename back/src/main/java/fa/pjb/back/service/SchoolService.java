package fa.pjb.back.service;

import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.vo.SchoolVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SchoolService {
    SchoolVO getSchoolInfo(Integer schoolId);

    Page<SchoolVO> getAllSchools(String name, String province, String district, String street,
        String email, String phone, Pageable pageable);

    Page<SchoolVO> getSchoolsByUserId(Integer userId, Pageable pageable, String name);

    SchoolVO addSchool(AddSchoolDTO schoolDTO, List<MultipartFile> image);

    boolean checkEmailExists(String email);

    boolean checkPhoneExists(String phone);

    SchoolVO editSchoolByAdmin(AddSchoolDTO schoolDTO, List<MultipartFile> image);
}
