package fa.pjb.back.repository;

import fa.pjb.back.model.entity.RequestCounselling;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface RequestCounsellingRepository extends JpaRepository<RequestCounselling, Integer>, JpaSpecificationExecutor<RequestCounselling> {

    List<RequestCounselling> findByStatus(byte status);

    List<RequestCounselling> findBySchoolIdAndStatus(Integer schoolId, Byte status);

    @Query("SELECT rc FROM RequestCounselling rc LEFT JOIN FETCH rc.parent WHERE rc.id = :requestCounsellingId")
    RequestCounselling findByIdWithParent(@Param("requestCounsellingId") Integer id);

    Page<RequestCounselling> findByStatusIn(List<Byte> statuses, Pageable pageable);
}