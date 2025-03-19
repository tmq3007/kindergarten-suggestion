package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "School_Owner")
@ToString(exclude = {"user", "school", "images"})
public class SchoolOwner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @ManyToOne(fetch = FetchType.LAZY,cascade = CascadeType.PERSIST)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(name = "assign_time")
    private LocalDate assignTime;

    @OneToMany(mappedBy = "schoolOwner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Media> images;

    @Column(name = "business_registration_number")
    private String business_registration_number;

}