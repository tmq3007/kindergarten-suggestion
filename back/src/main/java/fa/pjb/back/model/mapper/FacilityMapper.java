package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.Facility;
import fa.pjb.back.model.vo.FacilityVO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FacilityMapper {
    FacilityVO toFacilityVO(Facility facility);
}
