package fa.pjb.back.repository.specification;

import fa.pjb.back.model.entity.School;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class SchoolSpecification {

    public static Specification<School> hasName(String name) {
        return (root, query, cb) -> name == null ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<School> hasType(Byte type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("schoolType"), type);
    }

    public static Specification<School> hasReceivingAge(Byte age) {
        return (root, query, cb) -> age == null ? null : cb.lessThanOrEqualTo(root.get("receivingAge"), age);
    }

    public static Specification<School> hasFeeRange(Long minFee, Long maxFee) {
        return (root, query, cb) -> {
            if (minFee == null && maxFee == null) return null;
            if (minFee != null && maxFee != null) {
                return cb.between(root.get("feeFrom"), minFee, maxFee);
            }
            if (minFee != null) {
                return cb.greaterThanOrEqualTo(root.get("feeFrom"), minFee);
            }
            return cb.lessThanOrEqualTo(root.get("feeFrom"), maxFee);
        };
    }

    public static Specification<School> hasAllFacilitiesAndUtilities(List<Integer> facilityIds, List<Integer> utilityIds) {
        return (root, query, cb) -> {
            List<Predicate> wherePredicates = new ArrayList<>();
            List<Predicate> havingPredicates = new ArrayList<>();

            // Xử lý facilities nếu danh sách không null và không rỗng
            if (facilityIds != null && !facilityIds.isEmpty()) {
                var facilityJoin = root.join("facilities");
                wherePredicates.add((Predicate) facilityJoin.get("id").in(facilityIds));
                havingPredicates.add((Predicate) cb.equal(cb.countDistinct(facilityJoin.get("id")), facilityIds.size()));
            }

            // Xử lý utilities nếu danh sách không null và không rỗng
            if (utilityIds != null && !utilityIds.isEmpty()) {
                var utilityJoin = root.join("utilities");
                wherePredicates.add((Predicate) utilityJoin.get("id").in(utilityIds));
                havingPredicates.add((Predicate) cb.equal(cb.countDistinct(utilityJoin.get("id")), utilityIds.size()));
            }

            // Nếu cả hai danh sách đều null hoặc rỗng, không lọc
            if (wherePredicates.isEmpty()) {
                return null;
            }

            // Áp dụng GROUP BY và HAVING
            query.groupBy(root.get("id"));
            if (!havingPredicates.isEmpty()) {
                query.having(cb.and(havingPredicates.toArray(new Predicate[0])));
            }

            // Kết hợp các điều kiện trong WHERE
            return cb.and(wherePredicates.toArray(new Predicate[0]));
        };
    }
    public static Specification<School> hasProvince(String province) {
        return (root, query, cb) -> province == null ? null : cb.equal(root.get("province"), province);
    }

    public static Specification<School> hasDistrict(String district) {
        return (root, query, cb) -> district == null ? null : cb.equal(root.get("district"), district);
    }

}
