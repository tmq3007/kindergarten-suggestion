package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.boot.registry.selector.spi.StrategyCreator;

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
    private Integer id;

    @MapsId
    @OneToOne(optional = false, cascade = CascadeType.ALL,fetch = FetchType.LAZY)
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
    @Column(name = "street")
    private String street;
}