package fa.pjb.back.controller;

import fa.pjb.back.model.entity.Post;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("posts")
public class PostController {

    @GetMapping
    public String test(){
        return "test";
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    public Post getPostById(@PathVariable("id") String id) {
        return new Post(id, "Hello");
    }
}
