package fa.pjb.back.repository;

import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Integer> {
    Optional<School> findByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
}
