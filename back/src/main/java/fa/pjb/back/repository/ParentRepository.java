package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.mapper.ParentProjection;
import fa.pjb.back.model.vo.ParentVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent,Integer> {
    Parent findParentByUserId(Integer id);


    @Query("SELECT " +
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
            "    CASE WHEN EXISTS (SELECT 1 FROM ParentInSchool pis WHERE pis.parent = p AND pis.status = true) THEN true ELSE false END AS userStatus " +
            "FROM Parent p " +
            "JOIN p.user u " +
            "LEFT JOIN p.media m " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "       (CASE :searchBy " +
            "           WHEN 'username' THEN LOWER(u.username) " +
            "           WHEN 'fullname' THEN LOWER(u.fullname) " +
            "           WHEN 'email' THEN LOWER(u.email) " +
            "           WHEN 'phone' THEN LOWER(u.phone) " +
            "           ELSE '' " +
            "        END) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ParentProjection> findParentsWithFilters(
            @Param("searchBy") String searchBy,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Parent getParentById(Integer id);
    Optional<Parent> findByUserId(Integer userId);

}
