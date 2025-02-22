package fa.pjb.back.controller;

import fa.pjb.back.common.response.ApiResponse;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.service.ParentService;
import fa.pjb.back.service.impl.ParentServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("parents")
public class ParentController {

    @Autowired
    private ParentServiceImpl parentService;

    @PostMapping("")
    public ApiResponse<ParentDTO> createParent(@RequestBody ParentDTO parentDTO) {
        ParentDTO createdParent = parentService.createParent(parentDTO);
        return ApiResponse.<ParentDTO>builder()
                .code(200)
                .message("Parent created successfully")
                .data(createdParent)
                .build();
    }



}
