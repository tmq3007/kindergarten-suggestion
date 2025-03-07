package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.Utility;
import fa.pjb.back.model.vo.UtilityVO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UtilityMapper {
    UtilityVO toUtilityVO(Utility utility);
}
