package fa.pjb.back.model.dto;


import lombok.Builder;

import java.util.List;

@Builder
public record SchoolSearchDTO(

        String name,

        Byte type,

        Byte age,

        Long minFee,

        Long maxFee,

        List<Integer> facilityIds,

        List<Integer> utilityIds,

        String province,

        String district,

        int page,

        int size,

        String sortBy,

        String sortDirection

) {
}
