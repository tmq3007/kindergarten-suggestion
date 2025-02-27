package fa.pjb.back.repository;

import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsUserByUsername(String finalUsername);

    long countByUsernameStartingWith(String baseUsername);

    boolean existsByEmailAndIdNot(String email, int id);

    boolean existsByPhoneAndIdNot(String phone, int id);

    @Query("SELECT u FROM User u WHERE " +
            "(:role IS NULL OR u.role = :role) AND " +
            "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:name IS NULL OR LOWER(u.fullname) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:phone IS NULL OR u.phone LIKE CONCAT('%', :phone, '%'))")
    Page<User> findAllByCriteria(ERole role, String email, String name, String phone, Pageable pageable);
}
