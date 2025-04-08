package fa.pjb.back.model.enums;

import lombok.Getter;

@Getter
public enum ESchoolStatus {

    SAVED((byte) 0),
    SUBMITTED((byte) 1),
    APPROVED((byte) 2),
    REJECTED((byte) 3),
    PUBLISHED((byte) 4),
    UNPUBLISHED((byte) 5),
    DELETED((byte) 6);

    private final byte value;

    ESchoolStatus(byte value) {
        this.value = value;
    }

}