package fa.pjb.back.repository;

import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.mapper.SchoolOwnerProjection;
import fa.pjb.back.model.vo.ExpectedSchoolVO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface SchoolOwnerRepository extends JpaRepository<SchoolOwner, Integer> {

    Optional<SchoolOwner> findByUserId(Integer userId);

    List<SchoolOwner> findAllBySchoolId(Integer schoolID);

    @Query("""
                SELECT so.id AS id,so.user.id AS userId, u.username AS username, u.email AS email, so.expectedSchool AS expectedSchool, u.fullname AS fullname, u.phone AS phone
                FROM SchoolOwner so
                JOIN so.user u
                WHERE (:expectedSchool IS NULL OR so.expectedSchool = :expectedSchool) AND (so.business_registration_number = :BRN)
                AND so.school.id IS NULL
            """)
    List<SchoolOwnerProjection> searchSchoolOwnersByExpectedSchool(@Param("expectedSchool") String expectedSchool,@Param("BRN") String BRN);

    @Query("""
                SELECT so.id AS id,so.user.id AS userId, u.username AS username, u.email AS email, so.expectedSchool AS expectedSchool, u.fullname AS fullname, u.phone AS phone
                FROM SchoolOwner so
                JOIN so.user u
                WHERE (so.school.id = :schoolId)
            """)
    List<SchoolOwnerProjection> searchSchoolOwnersBySchoolId(@Param("schoolId") Integer schoolId);

    @Query("""
                SELECT  so.expectedSchool AS expectedSchool, so.business_registration_number as BRN
                FROM SchoolOwner so
                WHERE so.expectedSchool IS NOT NULL
                GROUP BY so.business_registration_number, so.expectedSchool
            """)
    List<Object[]> getAllExpectedschool();

    @Query("""
                SELECT  so.expectedSchool AS expectedSchool, so.business_registration_number as BRN
                FROM SchoolOwner so
                WHERE (so.user.id = :id) AND so.expectedSchool IS NOT NULL
            """)
    List<Object[]> getExpectedSchoolByUserId(@Param("id") Integer id);

    Set<SchoolOwner> findAllByIdIn(Set<Integer> ids);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM SchoolOwner s WHERE s.business_registration_number = :businessLicense")
    boolean existsSchoolOwnerByBusinessRegistrationNumber(String businessLicense);

    @Query("SELECT DISTINCT so FROM SchoolOwner so " +
            "LEFT JOIN FETCH so.school s " +
            "LEFT JOIN FETCH s.draft d " +
            "LEFT JOIN FETCH so.images i " +
            "WHERE so.user.id = :userId")
    Optional<SchoolOwner> findWithSchoolAndDraftByUserId(@Param("userId") Integer userId);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
        "FROM SchoolOwner s " +
        "WHERE s.business_registration_number = :brn " +
        "AND s.user.id != :userId")
    boolean existsSchoolOwnerByBusinessRegistrationNumberAndUserIdNot(
        @Param("brn") String business_registration_number,
        @Param("userId") Integer userId
    );
    @Query("SELECT so.school.id FROM SchoolOwner so WHERE so.user.id = :id")
    Integer getSchoolIdByUserId(@Param("id") Integer id);
    @Query("""
                SELECT so.id AS id,so.user.id AS userId, u.username AS username, u.email AS email, so.expectedSchool AS expectedSchool, u.fullname AS fullname, u.phone AS phone
                FROM SchoolOwner so
                JOIN so.user u
                WHERE (so.draft.id = :draftId)
            """)
    List<SchoolOwnerProjection> searchSchoolOwnersByDraftId(@Param("draftId") Integer draftId);

    @Query("SELECT so FROM SchoolOwner so WHERE so.school.id = :schoolId OR so.draft.id = :draftId")
    Set<SchoolOwner> findBySchoolIdAndDraftId(@Param("schoolId") Integer schoolId, @Param("draftId") Integer draftId);

    List<SchoolOwner> findAllByDraft(School draft);

}
