package fa.pjb.back.model.mapper;

import fa.pjb.back.model.dto.AddSchoolDTO;
import fa.pjb.back.model.dto.SchoolDTO;
import fa.pjb.back.model.entity.Facility;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.Utility;
import fa.pjb.back.model.vo.SchoolVO;
import fa.pjb.back.model.vo.UtilityVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface SchoolMapper {

//    @Mapping(source = "utilities", target = "utilities", qualifiedByName = "mapUtilitiesToVO")
    SchoolVO toSchoolVO(School school);

    // Convert Set<Utility> to Set<UtilityVO>
//    @Named("mapUtilitiesToVO")
//    default Set<UtilityVO> mapUtilitiesToVO(Set<Utility> utilities) {
//        if (utilities == null) return null;
//        return utilities.stream()
//                .map(utility -> new UtilityVO(utility.getName()))
//                .collect(Collectors.toSet());
//    }

    SchoolDTO toSchoolDTO(School school);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "facilities", source = "facilities", qualifiedByName = "mapFacilityIds")
    @Mapping(target = "utilities", source = "utilities", qualifiedByName = "mapUtilityIds")
    School toSchool(AddSchoolDTO schoolDTO);

    // Convert List<Integer> to Set<Facility>
    @Named("mapFacilityIds")
    default Set<Facility> mapFacilityIds(List<Integer> facilityIds) {
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
    default Set<Utility> mapUtilityIds(List<Integer> utilityIds) {
        if (utilityIds == null) return null;
        return utilityIds.stream()
                .map(id -> {
                    Utility utility = new Utility();
                    utility.setUid(id);
                    return utility;
                })
                .collect(Collectors.toSet());
    }
}
