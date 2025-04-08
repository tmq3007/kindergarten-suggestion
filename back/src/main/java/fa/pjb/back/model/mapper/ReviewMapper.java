package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.Review;
import fa.pjb.back.model.vo.ReviewVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "school.id", target = "schoolId")
    @Mapping(source = "school.name", target = "schoolName")
    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "parent.user.fullname", target = "parentName")
    @Mapping(source = "parent.media.url", target = "parentImage")
    ReviewVO toReviewVO(Review review);

    List<ReviewVO> toReviewVOList(List<Review> reviews);



    ReviewVO toReviewVOFromProjection(ReviewProjection projection);

    List<ReviewVO> toReviewVOListFromProjection(List<ReviewProjection> projections);
}