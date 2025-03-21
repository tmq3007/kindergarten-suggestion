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
            "WHERE (:email IS NULL OR u.email LIKE CONCAT('%', :email, '%')) " +
            "  AND (:fullname IS NULL OR u.fullname LIKE CONCAT('%', :fullname, '%')) " +
            "  AND (:fullname IS NULL OR u.username LIKE CONCAT('%', :fullname, '%')) " +
            "  AND (:phone IS NULL OR u.phone LIKE CONCAT('%', :phone, '%'))")

    Page<ParentProjection> findParentsWithFilters(
            @Param("email") String email,
            @Param("fullname") String fullname,
            @Param("username") String username,
            @Param("phone") String phone,
            Pageable pageable
    );

    Parent getParentById(Integer id);
    Optional<Parent> findByUserId(Integer userId);

}
