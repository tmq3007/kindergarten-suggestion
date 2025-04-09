package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@ToString(exclude = {"school", "parent"})
@Table(name = "Parent_In_School")
public class ParentInSchool {

    @EmbeddedId
    private ParentInSchoolId parentInSchoolId;

    @Column(name = "id", nullable = true, unique = true)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false, insertable=false, updatable=false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false, insertable=false, updatable=false)
    private Parent parent;

    @Column(name = "`to`")
    private LocalDate to;

    @Column(name = "`from`", nullable = false,insertable=false, updatable=false)
    private LocalDate from;

    @NotNull
    @ColumnDefault("b'0'")
    @Column(name = "status", nullable = false)
    private Byte status;

}