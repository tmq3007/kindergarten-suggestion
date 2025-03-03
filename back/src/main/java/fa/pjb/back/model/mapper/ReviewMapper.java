package fa.pjb.back.mapper;

import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.vo.ReviewVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "school.id", target = "schoolId")
    @Mapping(source = "school.name", target = "schoolName")
    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "parent.user.fullname", target = "parentName")
    ReviewVO toReviewVO(Review review);

    List<ReviewVO> toReviewVOList(List<Review> reviews);
}