package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Request_Counselling")
public class RequestCounselling {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "Parent_ID", nullable = false)
    private Parent parent;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "School_ID", nullable = false)
    private School school;

    @Lob
    @Column(name = "Inquiry")
    private String inquiry;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "Status", nullable = false)
    private Byte status;

    @Size(max = 255)
    @NotNull
    @Column(name = "Email", nullable = false)
    private String email;

    @Size(max = 20)
    @NotNull
    @Column(name = "Phone", nullable = false, length = 20)
    private String phone;

    @Size(max = 255)
    @NotNull
    @Column(name = "Name", nullable = false)
    private String name;

}