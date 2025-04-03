package fa.pjb.back.service;


import fa.pjb.back.common.util.UploadFileInterface;
import fa.pjb.back.model.enums.FileFolderEnum;
import fa.pjb.back.model.vo.FileUploadVO;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

public interface GCPFileStorageService {
    FileUploadVO uploadImage(File file, String fileNamePrefix, FileFolderEnum fileFolder);

    List<FileUploadVO> uploadListFiles(List<File> files, String fileNamePrefix, FileFolderEnum fileFolder,
                                       UploadFileInterface<File, String, FileFolderEnum, FileUploadVO> uploadMethod);

    FileUploadVO deleteUploadedImage(String fileId);

    List<java.io.File> convertMultiPartFileToFile(List<MultipartFile> list) throws IOException;

    FileUploadVO uploadFile(java.io.File file, String fileNamePrefix, FileFolderEnum fileFolder);
}
