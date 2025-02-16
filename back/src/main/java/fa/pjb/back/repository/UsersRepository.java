package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Users;
import org.springframework.data.repository.CrudRepository;

public interface UsersRepository extends CrudRepository<Users, Integer> {
}
