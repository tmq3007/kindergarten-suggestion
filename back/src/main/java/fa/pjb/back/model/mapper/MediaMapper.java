package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.vo.MediaVO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MediaMapper {
    MediaVO toMediaVO(Media media);
}
