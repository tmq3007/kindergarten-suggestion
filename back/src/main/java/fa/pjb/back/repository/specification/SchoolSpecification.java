package fa.pjb.back.repository.specification;

import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.entity.School;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class SchoolSpecification {

    public static Specification<School> hasName(String name) {
        if (name == null || name.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<School> hasType(Byte type) {
        if (type == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("schoolType"), type);
    }

    public static Specification<School> hasReceivingAge(Byte age) {
        if (age == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("receivingAge"), age);
    }

    public static Specification<School> hasFeeRange(Long minFee, Long maxFee) {
        if (minFee == null && maxFee == null) return null;

        if (minFee != null && maxFee != null) {
            return (root, query, cb) ->
                    cb.between(root.get("feeFrom"), minFee, maxFee);
        } else if (minFee != null) {
            return (root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("feeFrom"), minFee);
        } else {
            return (root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("feeFrom"), maxFee);
        }
    }

    public static Specification<School> hasAllFacilitiesAndUtilities(List<Integer> facilityIds, List<Integer> utilityIds) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (facilityIds != null && !facilityIds.isEmpty()) {
                for (Integer fid : facilityIds) {
                    Subquery<Integer> subquery = query.subquery(Integer.class);
                    Root<School> subRoot = subquery.from(School.class);
                    Join<Object, Object> joinFacilities = subRoot.join("facilities");

                    subquery.select(cb.literal(1))
                            .where(
                                    cb.equal(subRoot.get("id"), root.get("id")),
                                    cb.equal(joinFacilities.get("id"), fid)
                            );

                    predicates.add(cb.exists(subquery));
                }
            }

            if (utilityIds != null && !utilityIds.isEmpty()) {
                for (Integer uid : utilityIds) {
                    Subquery<Integer> subquery = query.subquery(Integer.class);
                    Root<School> subRoot = subquery.from(School.class);
                    Join<Object, Object> joinUtilities = subRoot.join("utilities");

                    subquery.select(cb.literal(1))
                            .where(
                                    cb.equal(subRoot.get("id"), root.get("id")),
                                    cb.equal(joinUtilities.get("id"), uid)
                            );

                    predicates.add(cb.exists(subquery));
                }
            }

            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };
    }


    public static Specification<School> hasProvince(String province) {
        if (province == null || province.isBlank()) return null;

        return (root, query, cb) ->
                cb.equal(root.get("province"), province);
    }

    public static Specification<School> hasDistrict(String district) {
        if (district == null || district.isBlank()) return null;

        return (root, query, cb) ->
                cb.equal(root.get("district"), district);
    }

    public static Specification<School> hasRatingSort(String sortDirection) {
        return (root, query, cb) -> {
            if (!query.getResultType().equals(Long.class)) {
                // Subquery phụ: lấy receiveDate mới nhất của trường hiện tại
                Subquery<LocalDate> maxDateSubquery = query.subquery(LocalDate.class);
                Root<Review> maxDateRoot = maxDateSubquery.from(Review.class);
                maxDateSubquery.select(cb.greatest(maxDateRoot.get("receiveDate").as(LocalDate.class)));
                maxDateSubquery.where(cb.equal(maxDateRoot.get("school").get("id"), root.get("id")));

                // Subquery chính: tính điểm trung bình từ review mới nhất
                Subquery<Double> subquery = query.subquery(Double.class);
                Root<Review> reviewRoot = subquery.from(Review.class);
                subquery.select(
                        cb.toDouble(
                                cb.quot(
                                        cb.sum(
                                                cb.sum(
                                                        cb.sum(
                                                                cb.sum(
                                                                        reviewRoot.get("learningProgram"),
                                                                        reviewRoot.get("facilitiesAndUtilities")
                                                                ),
                                                                reviewRoot.get("extracurricularActivities")
                                                        ),
                                                        reviewRoot.get("teacherAndStaff")
                                                ),
                                                reviewRoot.get("hygieneAndNutrition")
                                        ),
                                        5.0
                                )
                        )
                );

                if ("asc".equalsIgnoreCase(sortDirection)) {
                    query.orderBy(cb.asc(subquery));
                } else {
                    query.orderBy(cb.desc(subquery)); // Mặc định giảm dần
                }

                subquery.where(
                        cb.equal(reviewRoot.get("school").get("id"), root.get("id")),
                        cb.equal(reviewRoot.get("receiveDate"), maxDateSubquery)
                );

                if ("asc".equalsIgnoreCase(sortDirection)) {
                    query.orderBy(cb.asc(subquery));
                } else {
                    query.orderBy(cb.desc(subquery));
                }
            }
            return cb.conjunction();
        };
    }

}
