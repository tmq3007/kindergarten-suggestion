package fa.pjb.back.service.impl;

@FunctionalInterface
public interface UploadFileInterface<T, U, V, R> {
    R apply(T file, U fileNamePrefix, V fileFolder);
}
