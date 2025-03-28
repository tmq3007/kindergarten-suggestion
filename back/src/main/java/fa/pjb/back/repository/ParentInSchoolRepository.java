package fa.pjb.back.repository;

import fa.pjb.back.model.entity.ParentInSchool;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParentInSchoolRepository extends JpaRepository<ParentInSchool, Integer> {

    Optional<ParentInSchool> findOneById(Integer id);

    Integer countParentInSchoolBySchoolIdAndStatus(Integer schoolId, Byte status);

    void deleteParentInSchoolById(Integer id);

}
