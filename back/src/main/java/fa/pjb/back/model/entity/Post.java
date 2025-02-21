package fa.pjb.back.model.entity;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Post {
    private String title;
    private String content;
}
