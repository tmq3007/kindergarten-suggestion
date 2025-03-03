package fa.pjb.back.model.mapper;

import fa.pjb.back.model.dto.UserDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.vo.UserVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;

import static fa.pjb.back.model.enums.ERole.*;

@Mapper(componentModel = "spring")
public interface UserMapper {


    UserVO toUserVO(User user);
    UserDTO toUserDTO(User user);

    // Ánh xạ Page bằng cách ánh xạ danh sách trước
    default Page<UserVO> toUserVOPage(Page<User> page) {
        return page.map(this::toUserVO);
    }

    @Mappings({
            @Mapping(target = "id", expression = "java(user.getId())"),
            @Mapping(target = "fullname", expression = "java(user.getFullname())"),
            @Mapping(target = "email", expression = "java(user.getEmail())"),
            @Mapping(target = "phone", expression = "java(user.getPhone())"),
            @Mapping(target = "role", expression = "java(getRoleName(user.getRole()))"),
            @Mapping(target = "status", expression = "java(user.getStatus() != null && user.getStatus() ? \"Active\" : \"Inactive\")"),
            @Mapping(target = "address", expression = "java(formatAddress(user))") // Convert address
    })
    UserVO toUserVOFromProjection(UserProjection user);

    default String formatAddress(UserProjection user) {
        if (user.getStreet() == null && user.getWard() == null &&
                user.getDistrict() == null && user.getProvince() == null) {
            return "N/A";
        }
        String address = (user.getStreet() + " " + user.getWard() + " " + user.getDistrict() + " " + user.getProvince()).trim();
        return address.isBlank() ? "N/A" : address;
    }

    default String getRoleName(String role) {
        if (ROLE_PARENT.toString().equals(role)) return "Parent";
        if (ROLE_SCHOOL_OWNER.toString().equals(role)) return "School Owner";
        return "Admin";
    }

}
