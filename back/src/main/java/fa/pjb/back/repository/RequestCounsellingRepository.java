package fa.pjb.back.repository;

import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.mapper.RequestCounsellingProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.domain.Specification;
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

    @Query("SELECT r.id AS id, r.name AS name, r.email AS email, r.phone AS phone, " +
        "r.status AS status, r.due_date AS dueDate, s.name AS schoolName, " +
        "s.street AS street, s.ward AS ward, s.district AS district, s.province AS province " +
        "FROM RequestCounselling r " +
        "LEFT JOIN r.school s " +
        "WHERE r.school.id = :schoolId AND r.status IN :statuses")
    Page<RequestCounsellingProjection> findBySchoolIdAndStatusIn(
        @Param("schoolId") Integer schoolId,
        @Param("statuses") List<Byte> statuses,
        Pageable pageable
    );
    @Query("SELECT r.id AS id, r.name AS name, r.email AS email, r.phone AS phone, " +
        "r.status AS status, r.due_date AS dueDate, s.name AS schoolName, " +
        "s.street AS street, s.ward AS ward, s.district AS district, s.province AS province " +
        "FROM RequestCounselling r " +
        "LEFT JOIN r.school s")
    Page<RequestCounsellingProjection> findAllProjected(Specification<RequestCounselling> spec, Pageable pageable);

    @Query("SELECT COUNT(rc) > 0 FROM RequestCounselling rc " +
            "WHERE rc.id = :requestId AND :ownerId IN (SELECT so.id FROM rc.school s JOIN s.schoolOwners so)")
    @EntityGraph(attributePaths = {"school", "school.schoolOwners"})
    boolean isRequestManagedByOwner(@Param("requestId") Integer requestId,
                                    @Param("ownerId") Integer ownerId);
}