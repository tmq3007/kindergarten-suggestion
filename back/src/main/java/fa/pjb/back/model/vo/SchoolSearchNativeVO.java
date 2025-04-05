package fa.pjb.back.model.vo;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
// Wrapping the results of a native SQL query
public class SchoolSearchNativeVO {

    private Integer id;

    private String name;

    private Byte schoolType;

    private String district;

    private String ward;

    private String province;

    private String street;

    private String email;

    private String phone;

    private Byte receivingAge;

    private Byte educationMethod;

    private Integer feeFrom;

    private Integer feeTo;

    private String website;

    private String description;

    private LocalDateTime postedDate;

    private Double rating;

    private List<Integer> facilities;

    private List<Integer> utilities;

    // Mapping a native SQL query result row to a Java object
    public SchoolSearchNativeVO(Object[] row) {

        this.id = (Integer) row[0];

        this.name = (String) row[1];

        this.schoolType = ((Number) row[2]).byteValue();

        this.district = (String) row[3];

        this.ward = (String) row[4];

        this.province = (String) row[5];

        this.street = (String) row[6];

        this.email = (String) row[7];

        this.phone = (String) row[8];

        this.receivingAge = ((Number) row[9]).byteValue();

        this.educationMethod = ((Number) row[10]).byteValue();

        this.feeFrom = (Integer) row[11];

        this.feeTo = (Integer) row[12];

        this.website = (String) row[13];

        this.description = (String) row[14];

        this.postedDate = row[15] != null ? ((Timestamp) row[15]).toLocalDateTime() : null;

        this.rating = row[16] != null ? ((Number) row[16]).doubleValue() : 0.0;

        // Convert String to List<Integer>
        // e.g. "1, 2, 3" -> [1, 2, 3]
        this.facilities = row[17] != null
                ? Arrays.stream(((String) row[17]).split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::valueOf)
                .collect(Collectors.toList())
                : List.of();

        this.utilities = row[18] != null
                ? Arrays.stream(((String) row[18]).split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::valueOf)
                .collect(Collectors.toList())
                : List.of();

    }

}
