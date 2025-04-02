package fa.pjb.back.repository;

import fa.pjb.back.model.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Integer>, JpaSpecificationExecutor<School> {

    Optional<School> findByEmail(String email);

    @Query("SELECT s FROM School s  WHERE s.id = :schoolId")
    Optional<School> findSchoolBySchoolId(@Param("schoolId") Integer schoolId);

    @Query("SELECT s FROM School s LEFT JOIN FETCH s.draft WHERE s.id = :schoolId")
    School findByIdWithDraft(@Param("schoolId") Integer schoolId);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(s) > 0 FROM School s LEFT JOIN s.draft d " +
            "WHERE s.email = :email " +
            "AND NOT (s.id = :schoolId OR (d IS NOT NULL AND d.id = :schoolId))")
    boolean existsByEmailExcept(@Param("email") String email, @Param("schoolId") Integer schoolId);

    @Query("SELECT s FROM School s JOIN SchoolOwner so ON s.id = so.school.id WHERE so.user.id = :userId and s.status != 6")
    Optional<School> findSchoolByUserIdAndStatusNotDelete(@Param("userId") Integer userId);

    @Query("SELECT s FROM School s " +
        "WHERE s.status NOT IN (0, 6) " +
        "AND (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
        "AND (:district IS NULL OR s.district = :district) " +
        "AND (:email IS NULL OR LOWER(s.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
        "AND (:phone IS NULL OR s.phone = :phone)")
    Page<School> findSchools(
        @Param("name") String name,
        @Param("district") String district,
        @Param("email") String email,
        @Param("phone") String phone,
        Pageable pageable);

    @Query("SELECT s FROM School s " +
        "WHERE s.status = 1 " +
        "AND s.originalSchool IS NULL " +
        "AND (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
        "AND (:district IS NULL OR s.district = :district) " +
        "AND (:email IS NULL OR LOWER(s.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
        "AND (:phone IS NULL OR s.phone = :phone)")
    Page<School> findActiveSchoolsWithoutRefId(
        @Param("name") String name,
        @Param("district") String district,
        @Param("email") String email,
        @Param("phone") String phone,
        Pageable pageable);

}