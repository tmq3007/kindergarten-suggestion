package fa.pjb.back.repository;

import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.SchoolOwnerProjection;
import fa.pjb.back.model.vo.SchoolOwnerVO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolOwnerRepository extends JpaRepository<SchoolOwner, Integer> {
    Optional<SchoolOwner> findByUserId(Integer userId);

    List<SchoolOwner> findAllBySchoolId(Integer schoolID);

    @Query("""
                SELECT so.id AS id, u.username AS username, u.email AS email, so.expectedSchool AS expectedSchool
                FROM SchoolOwner so
                JOIN so.user u
                WHERE (:searchParam IS NULL OR :searchParam = ''
                   OR LOWER(u.username) LIKE LOWER(CONCAT('%', :searchParam, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchParam, '%'))
                   OR LOWER(so.expectedSchool) LIKE LOWER(CONCAT('%', :searchParam, '%')))
                AND (:role IS NULL OR u.role = :role)
                AND so.school.id IS NULL
            """)
    List<SchoolOwnerProjection> searchSchoolOwners(@Param("searchParam") String searchParam, @Param("role") ERole role);

}
