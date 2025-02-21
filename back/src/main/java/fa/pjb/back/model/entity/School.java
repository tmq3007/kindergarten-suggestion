package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "School")
public class School {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "Name", nullable = false)
    private String name;

    @Size(max = 30)
    @NotNull
    @Column(name = "Phone", nullable = false, length = 30)
    private String phone;

    @Size(max = 255)
    @NotNull
    @Column(name = "Email", nullable = false)
    private String email;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "Receiving_Age", nullable = false)
    private Byte receivingAge;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "Education_Method", nullable = false)
    private Byte educationMethod;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "School_Type", nullable = false)
    private Byte schoolType;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "Status", nullable = false)
    private Byte status;

    @Size(max = 255)
    @Column(name = "Website")
    private String website;

    @Lob
    @Column(name = "Description")
    private String description;

    @Column(name = "Fee_From")
    private Integer feeFrom;

    @Column(name = "Fee_To")
    private Integer feeTo;

    @Size(max = 255)
    @Column(name = "Image")
    private String image;

    @Size(max = 255)
    @NotNull
    @Column(name = "District", nullable = false)
    private String district;

    @Size(max = 255)
    @NotNull
    @Column(name = "Ward", nullable = false)
    private String ward;

    @Size(max = 255)
    @NotNull
    @Column(name = "Province", nullable = false)
    private String province;

    @Size(max = 255)
    @NotNull
    @Column(name = "Street", nullable = false)
    private String street;

}