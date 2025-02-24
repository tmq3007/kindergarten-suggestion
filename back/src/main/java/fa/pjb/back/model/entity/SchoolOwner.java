package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "School_Owner")
public class SchoolOwner {
    @Id
    @Column(name = "User_ID", nullable = false)
    private Integer id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "User_ID", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "School_ID", nullable = true)
    private School school;

}