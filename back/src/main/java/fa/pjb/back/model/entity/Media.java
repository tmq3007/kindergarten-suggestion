package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "Media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "type", length = 10)
    private String type;

    @Column(name = "size")
    private String size;

    @Column(name = "user_id")
    private Integer userId;

    @NotNull
    @Column(name = "url", length = 1000)
    private String url;

    @NotNull
    @Column(name = "file_id", length = 255)
    private String fileId;

    @Column(name = "upload_time")
    @Temporal(TemporalType.DATE)
    private Date uploadTime;

    @Column(name = "filename", length = 255)
    private String filename;

    @ManyToOne
    @JoinColumn(name = "school_id")
    private School school;
}