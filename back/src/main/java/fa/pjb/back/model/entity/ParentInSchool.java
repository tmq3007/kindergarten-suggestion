package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "Parent_in_school")
public class ParentInSchool {
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
    @JoinColumn(name = "User_ID", nullable = false)
    private Parent user;

    @NotNull
    @Column(name = "`From`", nullable = false)
    private LocalDate from;

    @Column(name = "`To`")
    private LocalDate to;

    @NotNull
    @ColumnDefault("b'1'")
    @Column(name = "status", nullable = false)
    private Boolean status = false;

}