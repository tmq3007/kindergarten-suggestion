package fa.pjb.back.repository;

import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.UserProjection;
import fa.pjb.back.model.vo.UserVO;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsUserByEmail(String email);

    long countByUsernameStartingWith(String baseUsername);

    boolean existsByEmailAndIdNot(String email, int id);

    boolean existsByPhoneAndIdNot(String phone, int id);

    @Query("SELECT u.id AS id, u.fullname AS fullname, u.email AS email, u.phone AS phone, "
            + "u.role AS role, u.status AS status, "
            + "p.street AS street, p.ward AS ward, p.district AS district, p.province AS province "
            + "FROM User u LEFT JOIN Parent p ON u.id = p.id "
            + "WHERE (:roles IS NULL OR u.role IN :roles) "
            + "AND (:email IS NULL OR u.email LIKE %:email%) "
            + "AND (:name IS NULL OR u.fullname LIKE %:name%) "
            + "AND (:phone IS NULL OR u.phone LIKE %:phone%)")
    Page<UserProjection> findAllByCriteria(
            @Param("roles") List<ERole> roles,
            @Param("email") String email,
            @Param("name") String name,
            @Param("phone") String phone,
            Pageable pageable);


    @Query("SELECT u.email FROM User u WHERE u.role = :role AND u.status = true")
    List<String> findActiveUserEmailsByRole(ERole role);
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = true")
    List<User> findActiveUserByRole(ERole role);

    @Query("SELECT u as user " +
            "FROM ParentInSchool pis " +
            "JOIN pis.parent p " +
            "JOIN p.user u " +
            "WHERE pis.school.id = :schoolId " +
            "AND (:roles IS NULL OR u.role IN :roles) " +
            "AND (:email IS NULL OR u.email LIKE %:email%) " +
            "AND (:name IS NULL OR u.username LIKE %:name%) " +
            "AND (:phone IS NULL OR u.phone LIKE %:phone%)")
    Page<UserProjection> findAllBySchoolAndCriteria(@Param("roles") List<ERole> roles,
                                                    @Param("email") String email,
                                                    @Param("name") String name,
                                                    @Param("phone") String phone,
                                                    Pageable pageable,
                                                    @Param("schoolId") int schoolId);
}
