package fa.pjb.back.model.dto;

import lombok.Builder;

@Builder
public record SchoolDTO(
        Integer id,
        String name,
        String phone,
        String email,
        Byte receivingAge,
        Byte educationMethod,
        Byte schoolType,
        Byte status,
        String website,
        String description,
        Integer feeFrom,
        Integer feeTo,
        String image,
        String district,
        String ward,
        String province,
        String street
) {
}
