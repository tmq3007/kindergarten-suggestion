package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "School_ID", nullable = false)
    private School school;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "Parent_ID", nullable = false)
    private Parent parent;

    @NotNull
    @Column(name = "Learning_Program", nullable = false)
    private Byte learningProgram;

    @NotNull
    @Column(name = "Facilities_and_Utilities", nullable = false)
    private Byte facilitiesAndUtilities;

    @NotNull
    @Column(name = "Extracurricular_Activities", nullable = false)
    private Byte extracurricularActivities;

    @NotNull
    @Column(name = "Teacher_and_Staff", nullable = false)
    private Byte teacherAndStaff;

    @NotNull
    @Column(name = "Hygiene_and_Nutrition", nullable = false)
    private Byte hygieneAndNutrition;

    @Lob
    @Column(name = "Feedback")
    private String feedback;

}