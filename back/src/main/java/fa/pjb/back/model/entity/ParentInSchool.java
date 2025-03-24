package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Parent_In_School")
public class ParentInSchool {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @NotNull
    @Column(name = "`from`", nullable = false)
    private LocalDate from;

    @Column(name = "`to`")
    private LocalDate to;

    @NotNull
    @ColumnDefault("b'0'")
    @Column(name = "status", nullable = false)
    private Byte status;

    @EmbeddedId
    private ParentInSchoolId primaInSchoolId;

}