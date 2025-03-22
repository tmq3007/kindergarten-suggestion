package fa.pjb.back.repository;

import fa.pjb.back.model.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Integer> {
    Optional<School> findByEmail(String email);

    @Query("SELECT s FROM School s  WHERE s.id = :schoolId")
    Optional<School> findSchoolBySchoolId(@Param("schoolId") Integer schoolId);

    @Query("SELECT s FROM School s LEFT JOIN FETCH s.draft WHERE s.id = :schoolId")
    School findByIdWithDraft(@Param("schoolId") Integer schoolId);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(s) > 0 FROM School s WHERE s.email = :email AND s.id <> :schoolId AND s.draft.id <> :schoolId")
    boolean existsByEmailExcept(@Param("email") String email, @Param("schoolId") Integer schoolId);

    @Query("SELECT s FROM School s JOIN SchoolOwner so ON s.id = so.school.id WHERE so.user.id = :userId")
    Optional<School> findSchoolByUserId(@Param("userId") Integer userId);

    @Query(value = "SELECT s FROM School s " +
            "LEFT JOIN FETCH s.originalSchool " +
            "LEFT JOIN FETCH s.draft " +
            "WHERE " +
            "(:name IS NULL OR s.name LIKE %:name%) AND " +
            "(:province IS NULL OR s.province LIKE %:province%) AND " +
            "(:district IS NULL OR s.district LIKE %:district%) AND " +
            "(:street IS NULL OR s.street LIKE %:street%) AND " +
            "(:email IS NULL OR s.email LIKE %:email%) AND " +
            "(:phone IS NULL OR s.phone LIKE %:phone%)",
            countQuery = "SELECT COUNT(s) FROM School s WHERE " +
                    "(:name IS NULL OR s.name LIKE %:name%) AND " +
                    "(:province IS NULL OR s.province LIKE %:province%) AND " +
                    "(:district IS NULL OR s.district LIKE %:district%) AND " +
                    "(:street IS NULL OR s.street LIKE %:street%) AND " +
                    "(:email IS NULL OR s.email LIKE %:email%) AND " +
                    "(:phone IS NULL OR s.phone LIKE %:phone%)")
    Page<School> findSchools(
            @Param("name") String name,
            @Param("province") String province,
            @Param("district") String district,
            @Param("street") String street,
            @Param("email") String email,
            @Param("phone") String phone,
            Pageable pageable);
}