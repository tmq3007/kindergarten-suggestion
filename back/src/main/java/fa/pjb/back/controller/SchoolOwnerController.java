package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.model.dto.SchoolOwnerDTO;
import fa.pjb.back.service.SchoolOwnerService;
import fa.pjb.back.service.impl.SchoolOwnerServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("school-owners")
@RequiredArgsConstructor
public class SchoolOwnerController {

    private final SchoolOwnerServiceImpl schoolOwnerService;

    @PostMapping("/create")
    public ApiResponse<SchoolOwnerDTO> createSchoolOwner(@RequestBody SchoolOwnerDTO dto) {
        SchoolOwnerDTO response = schoolOwnerService.createSchoolOwner(dto);
        return ApiResponse.<SchoolOwnerDTO>builder()
                .code(200)
                .message("Parent created successfully")
                .data(response)
                .build();
    }
}
