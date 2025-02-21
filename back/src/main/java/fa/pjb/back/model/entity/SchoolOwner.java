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

    @Size(max = 20)
    @NotNull
    @Column(name = "Phone", nullable = false, length = 20)
    private String phone;

    @NotNull
    @Column(name = "Gender", nullable = false)
    private Boolean gender = false;

    @Size(max = 255)
    @NotNull
    @Column(name = "Fullname", nullable = false)
    private String fullname;

    @NotNull
    @Column(name = "DOB", nullable = false)
    private LocalDate dob;

}