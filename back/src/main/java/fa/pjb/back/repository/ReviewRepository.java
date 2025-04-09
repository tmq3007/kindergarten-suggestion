package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.mapper.ReviewProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    @Query("SELECT r FROM Review r " +
            "JOIN FETCH r.school s " +
            "JOIN FETCH r.parent p " +
            "JOIN FETCH p.user u " +
            "WHERE r.school.id = :schoolId " +
            "AND (:fromDate IS NULL OR r.receiveDate >= :fromDate) " +
            "AND (:toDate IS NULL OR r.receiveDate <= :toDate) " +
            "AND (s.status != 6) " +
            "AND (s.status != 0)" +
            "AND (:status IS NULL OR r.status = :status) " +
            "ORDER BY r.receiveDate DESC")
    List<Review> findAllBySchoolIdWithDateRangeAdmin(
            @Param("schoolId") Integer schoolId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") Byte status);

    @Query("SELECT r FROM Review r " +
            "JOIN FETCH r.school s " +
            "JOIN FETCH r.parent p " +
            "JOIN FETCH p.user u " +
            "WHERE r.school.id = :schoolId " +
            "AND (:fromDate IS NULL OR r.receiveDate >= :fromDate) " +
            "AND (:toDate IS NULL OR r.receiveDate <= :toDate) " +
            "AND (s.status != 6 )" +
            "AND (:status IS NULL OR r.status = :status) " +
            "ORDER BY r.receiveDate DESC")
    List<Review> findAllBySchoolIdWithDateRangeSO(
            @Param("schoolId") Integer schoolId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") Byte status);

    @Query("SELECT r FROM Review r " +
            "WHERE (r.learningProgram + r.facilitiesAndUtilities + r.extracurricularActivities + " +
            "r.teacherAndStaff + r.hygieneAndNutrition) / 5.0 = 5 " +
            "AND r.feedback IS NOT NULL " +
            "AND r.status = 0 " +
            "ORDER BY r.receiveDate DESC")
    List<Review> getTop4RecentFiveStarFeedbacks(Pageable pageable);

    @Query("SELECT r FROM Review r " +
            "JOIN FETCH r.school s " +
            "JOIN FETCH r.parent p " +
            "JOIN FETCH p.user u " +
            "WHERE r.status = :status " )
    List<Review> findAllByStatus(byte status);


    @Query("SELECT " +
            "r.id AS id, " +
            "s.id AS schoolId, " +
            "s.name AS schoolName, " +
            "p.id AS parentId, " +
            "u.fullname AS parentName, " +
            "u.parent.media.url AS parentImage, " +
            "r.learningProgram AS learningProgram, " +
            "r.facilitiesAndUtilities AS facilitiesAndUtilities, " +
            "r.extracurricularActivities AS extracurricularActivities, " +
            "r.teacherAndStaff AS teacherAndStaff, " +
            "r.hygieneAndNutrition AS hygieneAndNutrition, " +
            "r.feedback AS feedback, " +
            "r.receiveDate AS receiveDate, " +
            "r.report AS report, " +
            "r.status AS status " +
            "FROM Review r " +
            "JOIN r.school s " +
            "JOIN r.parent p " +
            "JOIN p.user u " +
            "WHERE r.school.id = :schoolId " +
            "AND (:star IS NULL OR FLOOR((r.extracurricularActivities " +
            "+ r.facilitiesAndUtilities " +
            "+ r.hygieneAndNutrition " +
            "+ r.learningProgram " +
            "+ r.teacherAndStaff) / 5) = :star) " +
            "AND r.status IN (0 , 2) " +
            "ORDER BY r.receiveDate DESC")
    Page<ReviewProjection> findReviewWithStarFilter(
            @Param("schoolId") Integer schoolId,
            Pageable pageable,
            @Param("star") Integer star);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.school.id = :schoolId AND r.status IN (0 , 2) ")
    Long countBySchoolId(Integer schoolId);

    @Query("SELECT AVG((r.learningProgram + r.facilitiesAndUtilities + r.extracurricularActivities + " +
            "r.teacherAndStaff + r.hygieneAndNutrition) / 5.0) FROM Review r WHERE r.school.id = :schoolId AND r.status IN (0 , 2) ")
    Double getAverageRatingBySchoolId(Integer schoolId);

    @Query("SELECT AVG(r.learningProgram) FROM Review r WHERE r.school.id = :schoolId AND r.status IN (0 , 2) ")
    Double getAvgLearningProgramBySchoolId(Integer schoolId);

    @Query("SELECT AVG(r.facilitiesAndUtilities) FROM Review r WHERE r.school.id = :schoolId AND r.status IN (0 , 2) ")
    Double getAvgFacilitiesBySchoolId(Integer schoolId);

    @Query("SELECT AVG(r.extracurricularActivities) FROM Review r WHERE r.school.id = :schoolId AND r.status IN (0 , 2) ")
    Double getAvgExtracurricularBySchoolId(Integer schoolId);

    @Query("SELECT AVG(r.teacherAndStaff) FROM Review r WHERE r.school.id = :schoolId AND r.status IN (0 , 2) ")
    Double getAvgTeachersBySchoolId(Integer schoolId);

    @Query("SELECT AVG(r.hygieneAndNutrition) FROM Review r WHERE r.school.id = :schoolId AND r.status IN (0 , 2) ")
    Double getAvgHygieneBySchoolId(Integer schoolId);
    @Query("SELECT r " +
            "FROM Review r " +
            "WHERE r.school.id = :schoolId " +
            "AND r.status IN (0 , 2) ")
    List<Review> findBySchoolId(Integer schoolId);
    @Query("SELECT r " +
            "FROM Review r " +
            "WHERE r.id = :id ")
    Optional<Review> findById(Integer id);
}