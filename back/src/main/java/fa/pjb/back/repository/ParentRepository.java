package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent,Integer> {
  Optional<Parent> findByUserId(Integer userId);
}
