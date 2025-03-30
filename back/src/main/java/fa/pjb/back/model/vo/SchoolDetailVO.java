package fa.pjb.back.model.vo;

import lombok.Builder;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Builder
public record SchoolDetailVO(

        Integer id,

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

        String website,

        String description,

        Set<FacilityVO> facilities,

        Set<UtilityVO> utilities,

        List<MediaVO> imageList,

        Date posted_date,

        ReviewVO review,

        Set<SchoolOwnerVO> schoolOwners
) {
}
