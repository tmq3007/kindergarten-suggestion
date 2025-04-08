package fa.pjb.back.service;

import fa.pjb.back.model.dto.ChangeSchoolStatusDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.dto.SchoolSearchDTO;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SchoolService {

    SchoolDetailVO getSchoolInfo(Integer schoolId);

    Page<SchoolListVO> getAllSchools(String name,
                                     String province,
                                     String district,
                                     String street,
                                     String email,
                                     String phone,
                                     Pageable pageable);

    SchoolDetailVO getSchoolByUserId(Integer userId);

    SchoolDetailVO getDraft(User user);

    SchoolDetailVO addSchool(SchoolDTO schoolDTO, List<MultipartFile> image);

    void updateSchoolStatusByAdmin(ChangeSchoolStatusDTO changeSchoolStatusDTO);

    SchoolDetailVO updateSchoolByAdmin(SchoolDTO schoolDTO, List<MultipartFile> images);

    SchoolDetailVO updateSchoolBySchoolOwner(SchoolDTO schoolDTO, List<MultipartFile> images);

    SchoolDetailVO saveSchoolBySchoolOwner(SchoolDTO schoolDTO, List<MultipartFile> images);

    void updateSchoolStatusBySchoolOwner(ChangeSchoolStatusDTO changeSchoolStatusDTO);

    boolean checkEmailExists(String email);

    boolean checkEditingEmailExists(String email, Integer schoolId);

    boolean checkPhoneExists(String phone);

    List<SchoolOwnerVO> findSchoolOwnerForAddSchool(String expectedSchool, String BRN);

    List<ExpectedSchoolVO> findAllDistinctExpectedSchoolsByRole(Integer id);

    Boolean mergeDraft(Integer schoolId);

    Boolean isDraft(Integer schoolId);

    Page<SchoolSearchVO> searchSchoolByCriteria(SchoolSearchDTO schoolSearchDTO);

    Page<SchoolListVO> getActiveSchoolsWithoutRefId(String name, String district, String email, String phone, Pageable pageable);

    Page<SchoolListVO> getAllDrafts(String name, String district, String email, String phone, Pageable pageable);

    Long countActiveSchoolsWithoutRefId();

    Long countAllDrafts();

    Page<SchoolSearchNativeVO> searchSchoolByCriteriaWithNative(SchoolSearchDTO dto);

    List<SchoolOwnerVO> findSchoolOwnerByDraft(Integer id);

    SchoolDetailVO getPublicSchoolInfo(Integer schoolId);
}
