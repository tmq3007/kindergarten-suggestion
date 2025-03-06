package fa.pjb.back.model.vo;

import java.util.List;
import java.util.Set;

public record SchoolVO(
        Byte status,
        String name,
        Byte schoolType,
        String district,
        String ward,
        String province,
        String street,
        String email,
        String phone,
        Byte receivingAge,
        Byte educationMethod,
        Integer feeFrom,
        Integer feeTo,
        String description,
        Set<FacilityVO> facilities,
        Set<UtilityVO> utilities,
        List<MediaVO> imageList
) {
}
