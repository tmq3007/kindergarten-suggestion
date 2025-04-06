package fa.pjb.back.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = {"images", "facilities", "utilities", "originalSchool", "schoolOwners", "reviews"})
@Entity
@Table(name = "School")
@NamedEntityGraph(
        name = "School.withFacilitiesAndUtilities",
        attributeNodes = {
                @NamedAttributeNode("facilities"),
                @NamedAttributeNode("utilities")
        }
)
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 30)
    @NotNull
    @Column(name = "phone", nullable = false, length = 30)
    private String phone;

    @Size(max = 255)
    @NotNull
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "receiving_age", nullable = false)
    private Byte receivingAge;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "education_method", nullable = false)
    private Byte educationMethod;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "school_type", nullable = false)
    private Byte schoolType;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "status", nullable = false)
    private Byte status;

    @Size(max = 255)
    @Column(name = "website")
    private String website;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "fee_from")
    private Integer feeFrom;

    @Column(name = "fee_to")
    private Integer feeTo;

    @Size(max = 255)
    @NotNull
    @Column(name = "district", nullable = false)
    private String district;

    @Size(max = 255)
    @NotNull
    @Column(name = "ward", nullable = false)
    private String ward;

    @Size(max = 255)
    @NotNull
    @Column(name = "province", nullable = false)
    private String province;

    @Size(max = 255)
    @NotNull
    @Column(name = "street", nullable = false)
    private String street;

    @NotNull
    @Column(name = "posted_date")
    @ColumnDefault("CURRENT_DATE")
    private LocalDateTime postedDate;

    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL)
    private List<Media> images;

    @ManyToMany
    @JoinTable(name = "School_Facilities",
            joinColumns = @JoinColumn(name = "school_id"),
            inverseJoinColumns = @JoinColumn(name = "fid"))
    private Set<Facility> facilities;

    @ManyToMany
    @JoinTable(name = "School_Utilities",
            joinColumns = @JoinColumn(name = "school_id"),
            inverseJoinColumns = @JoinColumn(name = "uid"))
    private Set<Utility> utilities;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ref_id")
    private School originalSchool;

    @OneToOne(mappedBy = "originalSchool")
    private School draft;

    @OneToMany(mappedBy = "school", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<SchoolOwner> schoolOwners;

    @OneToMany(mappedBy = "school", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Review> reviews;

}