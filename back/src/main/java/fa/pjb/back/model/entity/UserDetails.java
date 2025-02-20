package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_details")
@Data
public class UserDetails {

    @Id
    @Column(name = "UserID")
    private Integer userID;

    @OneToOne
    @MapsId
    @JoinColumn(name = "UserID")
    private User user;

    @Column(nullable = false, length = 255)
    private String fullName;

    @Column(nullable = false)
    private Boolean gender;

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 500)
    private String image;

    private String dateOfBirth;

    @Column(length = 255)
    private String district;

    @Column(length = 255)
    private String ward;

    @Column(length = 255)
    private String province;

    @Column(length = 255)
    private String street;
}

