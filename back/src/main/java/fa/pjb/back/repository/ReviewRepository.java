package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

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

}