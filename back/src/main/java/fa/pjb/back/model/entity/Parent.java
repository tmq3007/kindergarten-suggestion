package fa.pjb.back.model.entity;

import jakarta.persistence.*;
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
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    @Size(max = 255)
    @Column(name = "district", nullable = false)
    private String district;

    @Size(max = 255)
    @Column(name = "ward", nullable = false)
    private String ward;

    @Size(max = 255)
    @Column(name = "province", nullable = false)
    private String province;

    @Size(max = 255)
    @Column(name = "street" , nullable = true)
    private String street;
}