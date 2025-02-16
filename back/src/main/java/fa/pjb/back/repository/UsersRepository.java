package fa.pjb.back.repository;

import fa.pjb.back.model.entity.KssUser;
import org.springframework.data.repository.CrudRepository;

public interface UsersRepository extends CrudRepository<KssUser, Integer> {
}
