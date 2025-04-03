package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.mapper.ParentProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent, Integer> {

    Parent findParentByUserId(Integer id);

    @Query(
            value = "SELECT DISTINCT " +
                    "    p.id AS id, " +
                    "    p.district AS district, " +
                    "    p.ward AS ward, " +
                    "    p.province AS province, " +
                    "    p.street AS street, " +
                    "    u.id AS userId, " +
                    "    u.username AS username, " +
                    "    u.fullname AS fullname, " +
                    "    u.email AS email, " +
                    "    u.role AS role, " +
                    "    u.phone AS phone, " +
                    "    u.dob AS dob, " +
                    "    m.id AS mediaId, " +
                    "    m.url AS mediaUrl, " +
                    "    u.status AS status, " +
                    "    CASE WHEN pis.id IS NOT NULL THEN 1 ELSE 2 END AS userEnrollStatus " +
                    "FROM Parent p " +
                    "LEFT JOIN p.user u " +
                    "LEFT JOIN p.media m " +
                    "LEFT JOIN p.parentInSchools pis ON pis.parent = p AND pis.status = 1 " +
                    "WHERE (:status IS NULL OR u.status = :status) " +
                    "AND (:keyword IS NULL OR :keyword = '' OR " +
                    "       LOWER(CASE :searchBy " +
                    "           WHEN 'username' THEN u.username " +
                    "           WHEN 'fullname' THEN u.fullname " +
                    "           WHEN 'email' THEN u.email " +
                    "           WHEN 'phone' THEN u.phone " +
                    "           ELSE '' " +
                    "       END) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            countQuery = "SELECT COUNT(DISTINCT p.id) " +
                    "FROM Parent p " +
                    "LEFT JOIN p.user u " +
                    "LEFT JOIN p.media m " +
                    "LEFT JOIN p.parentInSchools pisEnroll ON pisEnroll.parent = p AND pisEnroll.status = 1 " +
                    "WHERE (:status IS NULL OR u.status = :status) " +
                    "AND (:keyword IS NULL OR :keyword = '' OR " +
                    "       LOWER(CASE :searchBy " +
                    "           WHEN 'username' THEN u.username " +
                    "           WHEN 'fullname' THEN u.fullname " +
                    "           WHEN 'email' THEN u.email " +
                    "           WHEN 'phone' THEN u.phone " +
                    "           ELSE '' " +
                    "       END) LIKE LOWER(CONCAT('%', :keyword, '%')))"
    )
    Page<ParentProjection> findAllParentsWithFilters(
            @Param("status") Boolean status,
            @Param("searchBy") String searchBy,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query(value = "SELECT " +
            "    p.id AS id, " +
            "    p.district AS district, " +
            "    p.ward AS ward, " +
            "    p.province AS province, " +
            "    p.street AS street, " +
            "    u.id AS userId, " +
            "    u.username AS username, " +
            "    u.fullname AS fullname, " +
            "    u.email AS email, " +
            "    u.role AS role, " +
            "    u.phone AS phone, " +
            "    u.dob AS dob, " +
            "    m.id AS mediaId, " +
            "    m.url AS mediaUrl, " +
            "    u.status AS status, " +
            "    pis.id AS pisId, " +
            "    1 AS userEnrollStatus, " +
            "    pis.from AS fromDate, " +
            "    pis.to AS toDate " +
            "FROM ParentInSchool pis " +
            "LEFT JOIN pis.parent p " +
            "LEFT JOIN p.user u " +
            "LEFT JOIN p.media m " +
            "WHERE pis.status = 1 AND pis.school.id = :schoolId " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "     (CASE :searchBy " +
            "         WHEN 'username' THEN LOWER(u.username) " +
            "         WHEN 'fullname' THEN LOWER(u.fullname) " +
            "         WHEN 'email' THEN LOWER(u.email) " +
            "         WHEN 'phone' THEN LOWER(u.phone) " +
            "         ELSE '' " +
            "      END) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ParentProjection> findActiveParentsInSchoolWithFilters(
            @Param("schoolId") Integer schoolId,
            @Param("searchBy") String searchBy,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query(
            "SELECT " +
                    "    p.id AS id, " +
                    "    p.district AS district, " +
                    "    p.ward AS ward, " +
                    "    p.province AS province, " +
                    "    p.street AS street, " +
                    "    u.id AS userId, " +
                    "    u.username AS username, " +
                    "    u.fullname AS fullname, " +
                    "    u.email AS email, " +
                    "    u.role AS role, " +
                    "    u.phone AS phone, " +
                    "    u.dob AS dob, " +
                    "    m.id AS mediaId, " +
                    "    m.url AS mediaUrl, " +
                    "    u.status AS status, " +
                    "    pis.id AS pisId, " +
                    "    pis.status AS userEnrollStatus, " +
                    "    pis.from AS fromDate, " +
                    "    pis.to AS toDate " +
                    "FROM ParentInSchool pis " +
                    "LEFT JOIN pis.parent p " +
                    "LEFT JOIN p.user u " +
                    "LEFT JOIN p.media m " +
                    "WHERE pis.status = 0 AND pis.school.id = :schoolId AND u.status = true " +
                    "AND (:keyword IS NULL OR :keyword = '' OR " +
                    "     (CASE :searchBy " +
                    "         WHEN 'username' THEN LOWER(u.username) " +
                    "         WHEN 'fullname' THEN LOWER(u.fullname) " +
                    "         WHEN 'email' THEN LOWER(u.email) " +
                    "         WHEN 'phone' THEN LOWER(u.phone) " +
                    "         ELSE '' " +
                    "      END) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "ORDER BY pis.from DESC ")
    Page<ParentProjection> findEnrollRequestBySchool(
            @Param("schoolId") Integer schoolId,
            @Param("searchBy") String searchBy,
            @Param("keyword") String keyword,
            Pageable pageable
    );

}
