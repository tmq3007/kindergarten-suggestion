package fa.pjb.back.repository;

import fa.pjb.back.model.entity.ParentInSchool;
import fa.pjb.back.model.entity.ParentInSchoolId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ParentInSchoolRepository extends JpaRepository<ParentInSchool, ParentInSchoolId> {

    List<ParentInSchool> findAllByParent_IdAndSchool_Id(Integer parentId, Integer schoolId);
    
    Optional<ParentInSchool> findOneById(Integer id);

    Integer countParentInSchoolBySchoolIdAndStatus(Integer schoolId, Byte status);

    void deleteParentInSchoolById(Integer id);

    @Query("SELECT pis, s, r " +
           "FROM ParentInSchool pis " +
           "JOIN pis.school s " +
           "LEFT JOIN Review r ON pis.school.id = r.school.id AND pis.parent.id = r.parent.id " +
           "WHERE pis.parent.id = :parentId AND (pis.status = 1 OR pis.status = 2) " +
           "ORDER BY pis.status ASC , pis.from DESC")
    List<Object[]> findAcademicHistoryWithReviews(@Param("parentId") Integer parentId);

    @Query("SELECT pis, r " +
            "FROM ParentInSchool pis " +
            "LEFT JOIN Review r ON pis.school.id = r.school.id AND pis.parent.id = r.parent.id " +
            "WHERE pis.parent.id = :parentId AND pis.school.id = :schoolId " +
            "ORDER BY pis.from DESC")
    List<Object[]> findLatestPisWithReview(@Param("parentId") Integer parentId,
                                     @Param("schoolId") Integer schoolId,
                                     Pageable pageable);
    @Query("SELECT pis, s, r " +
           "FROM ParentInSchool pis " +
           "JOIN pis.school s " +
           "LEFT JOIN Review r ON pis.school.id = r.school.id AND pis.parent.id = r.parent.id " +
           "WHERE pis.parent.id = :parentId AND pis.status = 1 " +
           "ORDER BY pis.from DESC")
    Page<Object[]> findPresentAcademicHistoryWithReviews(@Param("parentId") Integer parentId, Pageable pageable);

    @Query("SELECT pis, s, r " +
           "FROM ParentInSchool pis " +
           "JOIN pis.school s " +
           "LEFT JOIN Review r ON pis.school.id = r.school.id AND pis.parent.id = r.parent.id " +
           "WHERE pis.parent.id = :parentId AND pis.status = 2 " +
           "ORDER BY pis.from DESC")
    Page<Object[]> findPreviousAcademicHistoryWithReviews(@Param("parentId") Integer parentId, Pageable pageable);
}
