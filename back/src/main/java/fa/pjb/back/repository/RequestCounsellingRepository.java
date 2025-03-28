package fa.pjb.back.repository;

import fa.pjb.back.model.entity.RequestCounselling;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RequestCounsellingRepository extends JpaRepository<RequestCounselling, Integer>, JpaSpecificationExecutor<RequestCounselling> {

    @Query("SELECT COUNT(r) FROM RequestCounselling r WHERE r.school.id = :schoolId AND r.status = :status AND r.due_date < :threshold")
    long countOverdueRequestsBySchoolId(@Param("schoolId") Integer schoolId, @Param("status") byte status, @Param("threshold") LocalDateTime threshold);

    @Query("SELECT r.school.id, COUNT(r) FROM RequestCounselling r WHERE r.status = :status AND r.due_date < :threshold GROUP BY r.school.id")
    List<Object[]> countOverdueRequestsForAllSchools(@Param("status") byte status, @Param("threshold") LocalDateTime threshold);


    List<RequestCounselling> findByStatus(byte status);

    List<RequestCounselling> findBySchoolIdAndStatus(Integer schoolId, Byte status);

    @Query("SELECT rc FROM RequestCounselling rc LEFT JOIN FETCH rc.parent WHERE rc.id = :requestCounsellingId")
    RequestCounselling findByIdWithParent(@Param("requestCounsellingId") Integer id);

    @Query("SELECT rc FROM RequestCounselling rc LEFT JOIN FETCH rc.school s")
    List<RequestCounselling> findAllWithParentAndSchool();

    Page<RequestCounselling> findByStatusIn(List<Byte> statuses, Pageable pageable);

    Page<RequestCounselling> findBySchoolIdAndStatusIn(Integer schoolId, List<Byte> statuses, Pageable pageable);
}