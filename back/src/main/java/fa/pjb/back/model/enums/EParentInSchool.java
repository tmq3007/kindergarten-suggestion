package fa.pjb.back.model.enums;

import lombok.Getter;

@Getter
public enum EParentInSchool {

    PENDING((byte) 0),
    ACTIVE((byte) 1),
    INACTIVE((byte) 2);

    private final byte value;

    EParentInSchool(byte value) {
        this.value = value;
    }

}
