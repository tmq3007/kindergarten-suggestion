package fa.pjb.back.repository;

import fa.pjb.back.model.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Integer>, JpaSpecificationExecutor<School> {

    @Query("SELECT s FROM School s LEFT JOIN FETCH s.schoolOwners WHERE s.id = :id")
    Optional<School> findByIdWithSchoolOwners(@Param("id") Integer id);

    @Query(value = """
             -- Select school basic information along with calculated rating, facilities, and utilities
             SELECT\s
                 s.id, s.name, s.school_type,                    -- Basic school fields
                 s.district, s.ward, s.province, s.street,       -- Address fields
                 s.email, s.phone, s.receiving_age,              -- Contact and admission age
                 s.education_method, s.fee_from, s.fee_to,       -- Method and tuition fee range
                 s.website, s.description, s.posted_date,        -- Metadata

                 -- Calculate average rating from the latest review (only the latest one per school)
                 COALESCE((
                     SELECT ROUND(AVG(
                         r.learning_program + r.facilities_and_utilities +
                         r.extracurricular_activities + r.teacher_and_staff +
                         r.hygiene_and_nutrition
                     ) / 5.0, 1)
                     FROM Review r
                     WHERE r.school_id = s.id
                       AND r.receive_date = (
                           SELECT MAX(r2.receive_date)
                           FROM Review r2 WHERE r2.school_id = s.id
                       )
                 ), 0) AS rating,

                 -- Join and collect associated facility and utility IDs into comma-separated strings
                 GROUP_CONCAT(DISTINCT f.fid),
                 GROUP_CONCAT(DISTINCT u.uid)

             -- Join school with its facilities and utilities
             FROM School s
             LEFT JOIN School_Facilities sf ON sf.school_id = s.id
             LEFT JOIN Facilities f ON f.fid = sf.fid
             LEFT JOIN School_Utilities su ON su.school_id = s.id
             LEFT JOIN Utilities u ON u.uid = su.uid

             -- Filter conditions (nullable parameters allow optional filtering)
             WHERE (:province IS NULL OR s.province = :province)
               AND (:district IS NULL OR s.district = :district)
               AND (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')))
               AND (:type IS NULL OR s.school_type = :type)
               AND (:age IS NULL OR s.receiving_age <= :age)
               AND ((:minFee IS NULL AND :maxFee IS NULL)
                    OR (:minFee IS NOT NULL AND :maxFee IS NULL AND s.fee_from >= :minFee)
                    OR (:minFee IS NULL AND :maxFee IS NOT NULL AND s.fee_from <= :maxFee)
                    OR (s.fee_from BETWEEN :minFee AND :maxFee))

             -- Group by school to aggregate facilities and utilities properly
             GROUP BY s.id

             -- Ensure the school has exactly all selected facilities and utilities (not just partial match)
             HAVING
               (:facilitySize = 0 OR COUNT(DISTINCT CASE WHEN f.fid IN (:facilityIds) THEN f.fid END) = :facilitySize)
               AND (:utilitySize = 0 OR COUNT(DISTINCT CASE WHEN u.uid IN (:utilityIds) THEN u.uid END) = :utilitySize)

             -- Dynamic sorting based on client’s request: by rating or postedDate
             ORDER BY
                 CASE WHEN :sortBy = 'rating' AND :sortDirection = 'desc' THEN rating END DESC,
                 CASE WHEN :sortBy = 'rating' AND :sortDirection = 'asc' THEN rating END ASC,
                 CASE WHEN :sortBy = 'postedDate' AND :sortDirection = 'desc' THEN s.posted_date END DESC,
                 CASE WHEN :sortBy = 'postedDate' AND :sortDirection = 'asc' THEN s.posted_date END ASC,
                 CASE WHEN :sortBy = 'feeFrom' AND :sortDirection = 'desc' THEN s.fee_from END DESC,
                 CASE WHEN :sortBy = 'feeFrom' AND :sortDirection = 'asc' THEN s.fee_from END ASC
             -- Pagination: limit results and apply offset
             LIMIT :size OFFSET :offset
            \s""", nativeQuery = true)
    List<Object[]> searchSchoolsWithFacilityAndUtilityRaw(
            @Param("name") String name,
            @Param("type") Byte type,
            @Param("age") Byte age,
            @Param("minFee") Long minFee,
            @Param("maxFee") Long maxFee,
            @Param("province") String province,
            @Param("district") String district,
            @Param("facilityIds") List<Integer> facilityIds,
            @Param("utilityIds") List<Integer> utilityIds,
            @Param("facilitySize") int facilitySize,
            @Param("utilitySize") int utilitySize,
            @Param("sortBy") String sortBy,
            @Param("sortDirection") String sortDirection,
            @Param("size") int size,
            @Param("offset") int offset
    );

    @Query(value = """
                 -- Select school information along with aggregated rating, facilities, and utilities
                 SELECT\s
                     s.id, s.name, s.school_type,
                     s.district, s.ward, s.province, s.street,
                     s.email, s.phone, s.receiving_age,
                     s.education_method, s.fee_from, s.fee_to,
                     s.website, s.description,
                     s.posted_date,

                     -- Calculate average rating based on 5 criteria from the most recent review
                     COALESCE((
                         SELECT ROUND(AVG(
                             r.learning_program + r.facilities_and_utilities +
                             r.extracurricular_activities + r.teacher_and_staff +
                             r.hygiene_and_nutrition
                         ) / 5.0, 1)
                         FROM Review r
                         WHERE r.school_id = s.id
                           AND r.receive_date = (
                               SELECT MAX(r2.receive_date)
                               FROM Review r2 WHERE r2.school_id = s.id
                           )
                     ), 0) AS rating,

                     -- Concatenate list of facility IDs associated with the school
                     GROUP_CONCAT(DISTINCT f.fid),
                     -- Concatenate list of utility IDs associated with the school
                     GROUP_CONCAT(DISTINCT u.uid)

                 FROM School s
                 -- Join with facilities
                 LEFT JOIN School_Facilities sf ON sf.school_id = s.id
                 LEFT JOIN Facilities f ON f.fid = sf.fid
                 -- Join with utilities
                 LEFT JOIN School_Utilities su ON su.school_id = s.id
                 LEFT JOIN Utilities u ON u.uid = su.uid

                 -- Filtering conditions based on user-provided parameters
                 WHERE (:province IS NULL OR s.province = :province)
                   AND (:district IS NULL OR s.district = :district)
                   AND (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')))
                   AND (:type IS NULL OR s.school_type = :type)
                   AND (:age IS NULL OR s.receiving_age <= :age)
                   AND (
                        (:minFee IS NULL AND :maxFee IS NULL)
                     OR (:minFee IS NOT NULL AND :maxFee IS NULL AND s.fee_from >= :minFee)
                     OR (:minFee IS NULL AND :maxFee IS NOT NULL AND s.fee_from <= :maxFee)
                     OR (s.fee_from BETWEEN :minFee AND :maxFee)
                   )

                 -- Group results by school ID to apply aggregation functions
                 GROUP BY s.id

                 -- Dynamic ordering logic depending on sorting field and direction
                 ORDER BY
                     CASE WHEN :sortBy = 'rating' AND :sortDirection = 'desc' THEN rating END DESC,
                     CASE WHEN :sortBy = 'rating' AND :sortDirection = 'asc' THEN rating END ASC,
                     CASE WHEN :sortBy = 'postedDate' AND :sortDirection = 'desc' THEN s.posted_date END DESC,
                     CASE WHEN :sortBy = 'postedDate' AND :sortDirection = 'asc' THEN s.posted_date END ASC,
                     CASE WHEN :sortBy = 'feeFrom' AND :sortDirection = 'desc' THEN s.fee_from END DESC,
                     CASE WHEN :sortBy = 'feeFrom' AND :sortDirection = 'asc' THEN s.fee_from END ASC

                 -- Pagination: limit number of results and offset for pages
                 LIMIT :size OFFSET :offset
            \s""", nativeQuery = true)
    List<Object[]> searchSchoolsBasicRaw(
            @Param("name") String name,
            @Param("type") Byte type,
            @Param("age") Byte age,
            @Param("minFee") Long minFee,
            @Param("maxFee") Long maxFee,
            @Param("province") String province,
            @Param("district") String district,
            @Param("sortBy") String sortBy,
            @Param("sortDirection") String sortDirection,
            @Param("size") int size,
            @Param("offset") int offset
    );

    @Query(value = """
                -- Outer query: count number of records (schools) that satisfy all filter conditions
                SELECT COUNT(*)
                FROM (
                    -- Inner query: select school IDs that match all conditions
                    SELECT s.id
                    FROM School s
                    -- Join with facilities
                    LEFT JOIN School_Facilities sf ON sf.school_id = s.id
                    LEFT JOIN Facilities f ON f.fid = sf.fid
                    -- Join with utilities
                    LEFT JOIN School_Utilities su ON su.school_id = s.id
                    LEFT JOIN Utilities u ON u.uid = su.uid

                    -- Filtering based on user-specified parameters
                    WHERE (:province IS NULL OR s.province = :province)
                      AND (:district IS NULL OR s.district = :district)
                      AND (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')))
                      AND (:type IS NULL OR s.school_type = :type)
                      AND (:age IS NULL OR s.receiving_age <= :age)
                      AND (
                           (:minFee IS NULL AND :maxFee IS NULL)
                        OR (:minFee IS NOT NULL AND :maxFee IS NULL AND s.fee_from >= :minFee)
                        OR (:minFee IS NULL AND :maxFee IS NOT NULL AND s.fee_from <= :maxFee)
                        OR (s.fee_from BETWEEN :minFee AND :maxFee)
                      )

                    -- Group by school to allow aggregate filtering in HAVING clause
                    GROUP BY s.id

                    -- Filter to ensure the school has all the requested facilities and utilities
                    HAVING
                      (:facilitySize = 0 OR COUNT(DISTINCT CASE WHEN f.fid IN (:facilityIds) THEN f.fid END) = :facilitySize)
                      AND (:utilitySize = 0 OR COUNT(DISTINCT CASE WHEN u.uid IN (:utilityIds) THEN u.uid END) = :utilitySize)

                ) temp -- This subquery becomes a derived table named 'temp'
            """, nativeQuery = true)
    long countSchoolsWithFacilityAndUtility(
            @Param("name") String name,
            @Param("type") Byte type,
            @Param("age") Byte age,
            @Param("minFee") Long minFee,
            @Param("maxFee") Long maxFee,
            @Param("province") String province,
            @Param("district") String district,
            @Param("facilityIds") List<Integer> facilityIds,
            @Param("utilityIds") List<Integer> utilityIds,
            @Param("facilitySize") int facilitySize,
            @Param("utilitySize") int utilitySize
    );

    @Query(value = """
                -- Count the number of schools that match the basic search criteria
                SELECT COUNT(*)
                FROM School s
                WHERE
                    -- Filter by province if provided
                    (:province IS NULL OR s.province = :province)

                    -- Filter by district if provided
                    AND (:district IS NULL OR s.district = :district)

                    -- Filter by name if provided, using case-insensitive partial match
                    AND (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')))

                    -- Filter by school type if provided
                    AND (:type IS NULL OR s.school_type = :type)

                    -- Filter by maximum receiving age if provided
                    AND (:age IS NULL OR s.receiving_age <= :age)

                    -- Filter by tuition fee range if provided:
                    -- - no min/max: allow all
                    -- - only minFee: fee_from >= minFee
                    -- - only maxFee: fee_from <= maxFee
                    -- - both: fee_from BETWEEN minFee AND maxFee
                    AND (
                        (:minFee IS NULL AND :maxFee IS NULL)
                     OR (:minFee IS NOT NULL AND :maxFee IS NULL AND s.fee_from >= :minFee)
                     OR (:minFee IS NULL AND :maxFee IS NOT NULL AND s.fee_from <= :maxFee)
                     OR (s.fee_from BETWEEN :minFee AND :maxFee)
                    )
            """, nativeQuery = true)
    long countSchoolsBasic(
            @Param("name") String name,
            @Param("type") Byte type,
            @Param("age") Byte age,
            @Param("minFee") Long minFee,
            @Param("maxFee") Long maxFee,
            @Param("province") String province,
            @Param("district") String district
    );

    @Query("SELECT s FROM School s LEFT JOIN FETCH s.originalSchool WHERE s.id = :id")
    Optional<School> findByIdWithOriginalSchool(@Param("id") Integer id);

    Optional<School> findByEmail(String email);

    @Query("SELECT s FROM School s  WHERE s.id = :schoolId")
    Optional<School> findSchoolBySchoolId(@Param("schoolId") Integer schoolId);

    @Query("SELECT s FROM School s LEFT JOIN FETCH s.draft WHERE s.id = :schoolId")
    School findByIdWithDraft(@Param("schoolId") Integer schoolId);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(s) > 0 FROM School s LEFT JOIN s.draft d " +
           "WHERE s.email = :email " +
           "AND NOT (s.id = :schoolId OR (d IS NOT NULL AND d.id = :schoolId))")
    boolean existsByEmailExcept(@Param("email") String email, @Param("schoolId") Integer schoolId);

    @Query("SELECT s FROM School s JOIN SchoolOwner so ON s.id = so.school.id WHERE so.user.id = :userId and s.status != 6")
    Optional<School> findSchoolByUserIdAndStatusNotDelete(@Param("userId") Integer userId);

    @Query(value = "SELECT s FROM School s " +
                   "LEFT JOIN FETCH s.originalSchool " +
                   "LEFT JOIN FETCH s.draft " +
                   "WHERE " +
                   "(:name IS NULL OR s.name LIKE %:name%) AND " +
                   "(:province IS NULL OR s.province LIKE %:province%) AND " +
                   "(:district IS NULL OR s.district LIKE %:district%) AND " +
                   "(:street IS NULL OR s.street LIKE %:street%) AND " +
                   "(:email IS NULL OR s.email LIKE %:email%) AND " +
                   "(:phone IS NULL OR s.phone LIKE %:phone%)",
            countQuery = "SELECT COUNT(s) FROM School s WHERE " +
                         "(:name IS NULL OR s.name LIKE %:name%) AND " +
                         "(:province IS NULL OR s.province LIKE %:province%) AND " +
                         "(:district IS NULL OR s.district LIKE %:district%) AND " +
                         "(:street IS NULL OR s.street LIKE %:street%) AND " +
                         "(:email IS NULL OR s.email LIKE %:email%) AND " +
                         "(:phone IS NULL OR s.phone LIKE %:phone%)")
    Page<School> findSchools(
            @Param("name") String name,
            @Param("province") String province,
            @Param("district") String district,
            @Param("street") String street,
            @Param("email") String email,
            @Param("phone") String phone,
            Pageable pageable);

}