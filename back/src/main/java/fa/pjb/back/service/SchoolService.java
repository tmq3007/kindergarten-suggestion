package fa.pjb.back.service;

import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.vo.ExpectedSchoolVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.model.vo.SchoolListVO;
import fa.pjb.back.model.vo.SchoolOwnerVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SchoolService {
    SchoolDetailVO getSchoolInfo(Integer schoolId);

    Page<SchoolListVO> getAllSchools(String name, String province, String district, String street,
                                     String email, String phone, Pageable pageable);

    SchoolDetailVO getSchoolByUserId(Integer userId);

    SchoolDetailVO addSchool(SchoolDTO schoolDTO, List<MultipartFile> image);

    void updateSchoolStatusByAdmin(ChangeSchoolStatusDTO changeSchoolStatusDTO);

    SchoolDetailVO updateSchoolByAdmin(SchoolDTO schoolDTO, List<MultipartFile> images);

    void updateSchoolStatusBySchoolOwner(ChangeSchoolStatusDTO changeSchoolStatusDTO);

    boolean checkEmailExists(String email);

    boolean checkEditingEmailExists(String email, Integer schoolId);

    boolean checkPhoneExists(String phone);

    List<SchoolOwnerVO> findSchoolOwnerForAddSchool(String expectedSchool);

    List<ExpectedSchoolVO> findAllDistinctExpectedSchoolsByRole(Integer id);
}
