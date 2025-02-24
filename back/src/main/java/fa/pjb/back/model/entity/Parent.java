package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "Parent")
public class Parent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "User_ID", nullable = false)
    private Integer id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "User_ID", nullable = false)
    private User user;

    @Size(max = 255)
    @NotBlank
    @Column(name = "Fullname", nullable = false)
    private String fullName;

    @Size(max = 255)
    @Column(name = "District", nullable = true)
    private String district;

    @Size(max = 255)
    @Column(name = "Ward", nullable = true)
    private String ward;

    @Size(max = 255)
    @Column(name = "Province", nullable = true)
    private String province;

    @Size(max = 255)
    @Column(name = "Street", nullable = true)
    private String street;
}