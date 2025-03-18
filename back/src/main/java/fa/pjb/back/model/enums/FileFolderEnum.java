package fa.pjb.back.model.enums;

import lombok.Getter;

@Getter
public enum FileFolderEnum {
    SCHOOL_IMAGES("1y4dPmBKhV3iynHrT9wamsur2i15DWRuB"),
    USER_IMAGES("1N90M8W0m253NhFiJDFXitfrAFLWQFWc0"),
    SO_IMAGES("1qn-IFHWUim8d121r1aRLSzZLhltRibxA");

    private final String value;

    FileFolderEnum(String value){this.value=value;};

}
