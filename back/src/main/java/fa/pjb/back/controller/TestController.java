package fa.pjb.back.controller;

import fa.pjb.back.common.exception.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("test")
public class TestController {
    @GetMapping("hello")
    public String hello() {
        log.info("into controller");
        return "hello";
    }
}
