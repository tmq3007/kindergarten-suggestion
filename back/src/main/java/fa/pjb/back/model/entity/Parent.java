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

    @NotNull
    @Column(name = "Gender", nullable = false)
    private Boolean gender = false;

    @Size(max = 20)
    @NotBlank
    @Column(name = "Phone", nullable = false, length = 20)
    private String phone;

    @NotNull
    @Column(name = "DOB", nullable = false)
    private LocalDate dob;

    @Size(max = 255)
    @NotBlank
    @Column(name = "District", nullable = false)
    private String district;

    @Size(max = 255)
    @NotBlank
    @Column(name = "Ward", nullable = false)
    private String ward;

    @Size(max = 255)
    @NotBlank
    @Column(name = "Province", nullable = false)
    private String province;

    @Size(max = 255)
    @NotBlank
    @Column(name = "Street", nullable = false)
    private String street;
}