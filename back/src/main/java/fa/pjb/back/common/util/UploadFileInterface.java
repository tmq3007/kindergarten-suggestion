package fa.pjb.back.common.util;

@FunctionalInterface
public interface UploadFileInterface<T, U, V, R> {
    R apply(T file, U fileNamePrefix, V fileFolder);
}
