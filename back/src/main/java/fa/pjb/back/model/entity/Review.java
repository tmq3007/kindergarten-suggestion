package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Review")
public class Review {
    @EmbeddedId
    private ReviewId primaryId;

    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false, insertable=false, updatable=false)
    private School school;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false, insertable=false, updatable=false)
    private Parent parent;

    @NotNull
    @Column(name = "learning_program", nullable = false)
    private Byte learningProgram;

    @NotNull
    @Column(name = "facilities_and_utilities", nullable = false)
    private Byte facilitiesAndUtilities;

    @NotNull
    @Column(name = "extracurricular_activities", nullable = false)
    private Byte extracurricularActivities;

    @NotNull
    @Column(name = "teacher_and_staff", nullable = false)
    private Byte teacherAndStaff;

    @NotNull
    @Column(name = "hygiene_and_nutrition", nullable = false)
    private Byte hygieneAndNutrition;

    @Lob
    @Column(name = "feedback")
    private String feedback;

    @NotNull
    @Column(name = "receive_date", nullable = false)
    private LocalDateTime receiveDate;

    @Column(name = "report")
    private String report;

    @NotNull
    @Column(name = "status", nullable = false)
    private Byte status;



}