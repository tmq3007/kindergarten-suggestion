package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.ParentInSchool;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.mapper.ParentProjection;
import fa.pjb.back.model.vo.ParentVO;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent, Integer> {
    Parent findParentByUserId(Integer id);


    @Query("SELECT DISTINCT " +
            "    p.id AS id, " +
            "    p.district AS parentDistrict, " +
            "    p.ward AS parentWard, " +
            "    p.province AS parentProvince, " +
            "    p.street AS parentStreet, " +
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
            "    CASE WHEN pisEnroll.id IS NOT NULL THEN true ELSE false END AS userEnrollStatus " +
            "FROM Parent p " +
            "JOIN p.user u " +
            "LEFT JOIN p.media m " +
            "LEFT JOIN p.parentInSchools pisEnroll ON pisEnroll.status = true " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "       (CASE :searchBy " +
            "           WHEN 'username' THEN LOWER(u.username) " +
            "           WHEN 'fullname' THEN LOWER(u.fullname) " +
            "           WHEN 'email' THEN LOWER(u.email) " +
            "           WHEN 'phone' THEN LOWER(u.phone) " +
            "           ELSE '' " +
            "        END) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ParentProjection> findAllParentsWithFilters(
            @Param("searchBy") String searchBy,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("SELECT DISTINCT " +
            "    p.id AS id, " +
            "    p.district AS parentDistrict, " +
            "    p.ward AS parentWard, " +
            "    p.province AS parentProvince, " +
            "    p.street AS parentStreet, " +
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
            "    true AS userEnrollStatus " +
            "FROM Parent p " +
            "JOIN p.user u " +
            "LEFT JOIN p.media m " +
            "JOIN p.parentInSchools pis2 " +
            "WHERE pis2.status = true " +
            "AND pis2.school.id = :schoolId " +
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
            Pageable pageable);

    Parent getParentById(Integer id);

    Optional<Parent> findByUserId(Integer userId);

}
