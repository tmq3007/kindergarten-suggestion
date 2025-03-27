package fa.pjb.back.model.enums;

public enum ParentInSchoolEnum {

    PENDING((byte) 0),
    ACTIVE((byte) 1),
    INACTIVE((byte) 2);

    private final byte value;

    ParentInSchoolEnum(byte value) {
        this.value = value;
    }

    public byte getValue() {
        return value;
    }
}
