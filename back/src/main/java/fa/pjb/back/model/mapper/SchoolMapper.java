package fa.pjb.back.model.mapper;

import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.entity.Facility;
import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.Utility;
import fa.pjb.back.model.vo.SchoolVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface SchoolMapper {

    @Mapping(source = "facilities", target = "facilities", qualifiedByName = "facilityToId")
    @Mapping(source = "utilities", target = "utilities", qualifiedByName = "utilityToId")
    @Mapping(target = "imageList", source = "images", qualifiedByName = "mapImageUrl")
    SchoolVO toSchoolVO(School school);


    SchoolDTO toSchoolDTO(School school);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "facilities", source = "facilities", qualifiedByName = "mapFacilityIds")
    @Mapping(target = "utilities", source = "utilities", qualifiedByName = "mapUtilityIds")
    School toSchoolEntityFromAddSchoolDTO(AddSchoolDTO schoolDTO);

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
    default List<String> mapImageUrl(List<Media> media) {
        if (media == null) return null;
        return media.stream().map(Media::getUrl).toList();
    }

    @Named("facilityToId")
    default Set<Integer> mapFacilities(Set<Facility> facilities) {
        return facilities != null ? facilities.stream().map(Facility::getFid).collect(Collectors.toSet()) : null;
    }

    @Named("utilityToId")
    default Set<Integer> mapUtilities(Set<Utility> utilities) {
        return utilities != null ? utilities.stream().map(Utility::getUid).collect(Collectors.toSet()) : null;
    }
}
