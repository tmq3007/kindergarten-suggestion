package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "Parent")
@Data
public class Parent {

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

    @Column
    private Date DOB;

    @Column(length = 255)
    private String district;

    @Column(length = 255)
    private String ward;

    @Column(length = 255)
    private String province;

    @Column(length = 255)
    private String street;
}

