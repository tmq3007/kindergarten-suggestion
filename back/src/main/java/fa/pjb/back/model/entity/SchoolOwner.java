package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "School_Owner")
@ToString(exclude = {"user", "school"})
public class SchoolOwner {
    @Id
    //@GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "expected_school")
//    @Max(value = 255)
    private String expectedSchool;

    @Column(name = "public_permission" )
    private Boolean publicPermission;

    @OneToOne(cascade = CascadeType.ALL,fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(name = "assign_time")
    private LocalDate assignTime;

}