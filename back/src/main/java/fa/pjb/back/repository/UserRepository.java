package fa.pjb.back.repository;

import fa.pjb.back.model.entity.KssUser;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface UserRepository extends CrudRepository<KssUser, Integer> {
    Optional<KssUser> findByUsername(String username);

    Optional<KssUser> findByEmail(String email);
}
