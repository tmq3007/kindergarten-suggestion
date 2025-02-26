package fa.pjb.back.model.mapper;

import fa.pjb.back.model.dto.UserDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.UserVO;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserVO toUserVO(User user);

    // Ánh xạ Page bằng cách ánh xạ danh sách trước
    default Page<UserVO> toUserVOPage(Page<User> page) {
        return page.map(this::toUserVO);
    }

}
