package fa.pjb.back.model.entity;

import fa.pjb.back.model.enums.ERole;
import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "User")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private Boolean status;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ERole role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Parent Parent;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private SchoolOwner SchoolOwner;

    @NotNull
    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Size(max = 20)
    @NotNull
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Set.of(new SimpleGrantedAuthority(role.toString()));
    }

}
