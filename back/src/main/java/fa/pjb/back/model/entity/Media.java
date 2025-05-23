package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Media")
@ToString
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id",nullable = false)
    private Integer id;

    @Column(name = "type", length = 10)
    private String type;

    @Column(name = "size", length = 10)
    private String size;

    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    @Column(name = "upload_time", nullable = false)
    private LocalDate uploadTime;

    @Column(name = "filename", length = 255)
    private String filename;

    @Column(name = "cloud_id", length = 255)
    private String cloudId;

    @OneToOne(mappedBy = "media",fetch = FetchType.LAZY)
    @ToString.Exclude
    private Parent parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    @ToString.Exclude
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_owner_id")
    @ToString.Exclude
    private SchoolOwner schoolOwner;

}