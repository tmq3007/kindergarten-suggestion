package fa.pjb.back.model.mapper;

import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.dto.SchoolUpdateDTO;
import fa.pjb.back.model.entity.Facility;
import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.Utility;
import fa.pjb.back.model.vo.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface SchoolMapper {

    @Mapping(source = "facilities", target = "facilities", qualifiedByName = "facilityToId")
    @Mapping(source = "utilities", target = "utilities", qualifiedByName = "utilityToId")
    @Mapping(target = "imageList", source = "images", qualifiedByName = "mapImageUrl")
    SchoolDetailVO toSchoolDetailVO(School school);

    SchoolListVO toSchoolListVO(School school);

    SchoolDTO toSchoolDTO(School school);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "facilities", source = "facilities", qualifiedByName = "mapFacilityIds")
    @Mapping(target = "utilities", source = "utilities", qualifiedByName = "mapUtilityIds")
    School toSchool(AddSchoolDTO schoolDTO);

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

    @Mapping(target = "facilities", ignore = true)
    @Mapping(target = "utilities", ignore = true)
    void updateSchoolFromDto(SchoolUpdateDTO schoolUpdateDTO, @MappingTarget School school);

}
