package fa.pjb.back.repository;

import fa.pjb.back.model.entity.RequestCounselling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RequestCounsellingRepository extends JpaRepository<RequestCounselling, Integer>, JpaSpecificationExecutor<RequestCounselling> {

    List<RequestCounselling> findByStatus(byte status);

    List<RequestCounselling> findBySchoolIdAndStatus(Integer schoolId, Byte status);

    @Query("SELECT rc FROM RequestCounselling rc LEFT JOIN FETCH rc.school s")
    List<RequestCounselling> findAllWithParentAndSchool();
}