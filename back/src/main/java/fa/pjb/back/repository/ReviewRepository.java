package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    @Query("SELECT r FROM Review r JOIN FETCH r.school JOIN FETCH r.parent WHERE r.school.id = :schoolId ORDER BY r.receiveDate DESC")
    List<Review> getAllBySchool_Id(Integer schoolId);

    @Query("SELECT r FROM Review r " +
            "WHERE (r.learningProgram + r.facilitiesAndUtilities + r.extracurricularActivities + " +
            "r.teacherAndStaff + r.hygieneAndNutrition) / 5.0 = 5 " +
            "AND r.feedback IS NOT NULL " +
            "ORDER BY r.receiveDate DESC")
    List<Review> getTop4RecentFiveStarFeedbacks();

}