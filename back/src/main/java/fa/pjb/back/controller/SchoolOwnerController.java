package fa.pjb.back.controller;

import fa.pjb.back.model.vo.SchoolOwnerVO;
import fa.pjb.back.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("school-owner")
public class SchoolOwnerController {
    @Autowired
    private SchoolService schoolService;

    @GetMapping("/search")
    public List<SchoolOwnerVO> searchSchoolOwners(@RequestParam("q") String searchParam) {
        return schoolService.findSchoolOwnerForAddSchool(searchParam);
    }
}
