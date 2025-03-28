package fa.pjb.back.repository;

import fa.pjb.back.model.entity.ParentInSchool;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentInSchoolRepository extends JpaRepository<ParentInSchool,Long> {

    Integer countParentInSchoolBySchoolIdAndStatus(Integer schoolId, Byte status);

    void deleteParentInSchoolById(Integer id);
}
