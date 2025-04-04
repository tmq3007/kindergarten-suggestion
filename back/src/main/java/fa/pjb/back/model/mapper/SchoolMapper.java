package fa.pjb.back.model.mapper;

import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.vo.*;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {ReviewMapper.class})
public interface SchoolMapper {

    @Mapping(source = "facilities", target = "facilities", qualifiedByName = "facilityToId")
    @Mapping(source = "utilities", target = "utilities", qualifiedByName = "utilityToId")
    @Mapping(target = "imageList", source = "images", qualifiedByName = "mapImageUrl")
    SchoolDetailVO toSchoolDetailVO(School school);

    @Mapping(source = "facilities", target = "facilities", qualifiedByName = "facilityToId")
    @Mapping(source = "utilities", target = "utilities", qualifiedByName = "utilityToId")
    @Mapping(target = "imageList", source = "images", qualifiedByName = "mapImageUrl")
    @Mapping(target = "reviews",
            expression = "java(getLatestReviewVO(school, reviewMapper))")
    SchoolSearchVO toSchoolSearchVO(School school, @Context ReviewMapper reviewMapper);

    default ReviewVO getLatestReviewVO(School school, ReviewMapper reviewMapper) {
        if (school.getReviews() == null || school.getReviews().isEmpty()) return null;

        return school.getReviews().stream()
                .max((r1, r2) -> r1.getReceiveDate().compareTo(r2.getReceiveDate()))
                .map(reviewMapper::toReviewVO)
                .orElse(null);
    }

    @Named("mapRefId")
    default Integer mapRefId(School school) {
        return school.getOriginalSchool() != null ? school.getOriginalSchool().getId() : null;
    }

    @Mapping(source = "school.facilities", target = "facilities", qualifiedByName = "facilityToId")
    @Mapping(source = "school.utilities", target = "utilities", qualifiedByName = "utilityToId")
    @Mapping(source = "school.images", target = "imageList", qualifiedByName = "mapImageUrl")
    @Mapping(target = "schoolOwners",source = "schoolOwnerVOList")
    @Mapping(source = "school", target = "refId", qualifiedByName = "mapRefId")
    SchoolDetailVO toSchoolDetailVOWithSchoolOwners(School school, List<SchoolOwnerVO> schoolOwnerVOList);

    SchoolListVO toSchoolListVO(School school);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "facilities", ignore = true)
    @Mapping(target = "utilities", ignore = true)
    @Mapping(target = "schoolOwners", ignore = true)
    School toSchool(SchoolDTO schoolDTO);

    @Mapping(source = "facilities", target = "facilities", qualifiedByName = "mapFacilityIds")
    @Mapping(source = "utilities", target = "utilities", qualifiedByName = "mapUtilityIds")
    @Mapping(target = "schoolOwners", ignore = true)
    School toSchool(SchoolDTO schoolDTO, @MappingTarget School school);

    @Mapping(source = "facilities", target = "facilities", qualifiedByName = "mapFacilityIds")
    @Mapping(source = "utilities", target = "utilities", qualifiedByName = "mapUtilityIds")
    @Mapping(target = "schoolOwners", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "id", ignore = true)
    School toDraft(SchoolDTO schoolDTO, @MappingTarget School draft);

    // Convert List<Integer> to Set<Facility>
    @Named("mapFacilityIds")
    default Set<Facility> mapFacilityIds(Set<Integer> facilityIds) {
        if (facilityIds == null) return null;
        return facilityIds.stream()
                .map(id -> {
                    Facility facility = new Facility();
                    facility.setFid(id);
                    return facility;
                })
                .collect(Collectors.toSet());
    }

    // Convert Set<String> to Set<SchoolOwner>
    @Named("mapSchoolOwnerIds")
    default Set<SchoolOwner> mapSchoolOwnerIds(Set<Integer> schoolOwnerIds) {
        if (schoolOwnerIds == null) return null;
        return schoolOwnerIds.stream()
                .map(id -> {
                    SchoolOwner schoolOwner = new SchoolOwner();
                    schoolOwner.setId(id); // Assuming SchoolOwner.id is Integer
                    return schoolOwner;
                })
                .collect(Collectors.toSet());
    }

    // Convert List<Integer> to Set<Utility>
    @Named("mapUtilityIds")
    default Set<Utility> mapUtilityIds(Set<Integer> utilityIds) {
        if (utilityIds == null) return null;
        return utilityIds.stream()
                .map(id -> {
                    Utility utility = new Utility();
                    utility.setUid(id);
                    return utility;
                })
                .collect(Collectors.toSet());
    }

    @Named("mapImageUrl")
    default List<MediaVO> mapImageUrl(List<Media> media) {
        if (media == null) return null;
        return media.stream().map(media1 -> new MediaVO(media1.getUrl(), media1.getFilename(), media1.getCloudId())).toList();
    }

    @Named("facilityToId")
    default Set<FacilityVO> mapFacilities(Set<Facility> facilities) {
        return facilities != null ? facilities.stream().map(facility -> new FacilityVO(facility.getFid(), facility.getName())).collect(Collectors.toSet()) : null;
    }

    @Named("utilityToId")
    default Set<UtilityVO> mapUtilities(Set<Utility> utilities) {
        return utilities != null ? utilities.stream().map(utility -> new UtilityVO(utility.getUid(), utility.getName())).collect(Collectors.toSet()) : null;
    }

}
