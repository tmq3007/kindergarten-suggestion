package fa.pjb.back.repository;

import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.enums.ERole;
import fa.pjb.back.model.mapper.UserProjection;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.parent WHERE u.id = :userId")
    Optional<User> findByIdWithParent(Integer userId);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    long countByUsernameStartingWith(String baseUsername);

    @Query("SELECT u.username FROM User u WHERE u.username LIKE CONCAT(:prefix, '%')")
    List<String> findUsernamesStartingWith(@Param("prefix") String prefix);



    boolean existsByEmailAndIdNot(String email, Integer id);

    boolean existsByEmail(String email);

    @Query("SELECT " +
            "    u.id AS id, " +
            "    u.fullname AS fullname, " +
            "    u.email AS email, " +
            "    u.phone AS phone, " +
            "    u.role AS role, " +
            "    u.status AS status, " +
            "    p.street AS street, " +
            "    p.ward AS ward, " +
            "    p.district AS district, " +
            "    p.province AS province " +
            "FROM User u " +
            "LEFT JOIN Parent p ON p.user = u " +
            "WHERE (:roles IS NULL OR u.role IN :roles) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "     (CASE :searchBy " +
            "         WHEN 'username' THEN LOWER(u.username) " +
            "         WHEN 'fullname' THEN LOWER(u.fullname) " +
            "         WHEN 'email' THEN LOWER(u.email) " +
            "         WHEN 'phone' THEN LOWER(u.phone) " +
            "         ELSE '' " +
            "      END) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<UserProjection> findAllByCriteria(
            @Param("roles") List<ERole> roles,
            @Param("searchBy") String searchBy,
            @Param("keyword") String keyword,
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

    @Query("SELECT u.email FROM User u WHERE u.username = :username")
    Optional<String> findEmailByUsername(@Param("username") String username);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, Integer id);
}
