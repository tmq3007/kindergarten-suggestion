package fa.pjb.back.service.impl;

import com.google.cloud.storage.*;
import fa.pjb.back.common.util.UploadFileInterface;
import fa.pjb.back.model.enums.EFileFolder;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.service.GCPFileStorageService;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PreDestroy;
import javax.imageio.IIOException;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GCPFileStorageServiceImpl implements GCPFileStorageService {

    @Autowired
    private Storage storage;

    private static final Dotenv dotenv = Dotenv.load();
    private final String bucketName = dotenv.get("GCP_BUCKET_NAME");
    private final ExecutorService executorService;

    public GCPFileStorageServiceImpl() {
        // Initialize thread pool with a reasonable size
        this.executorService = Executors.newFixedThreadPool(Math.min(10, Runtime.getRuntime().availableProcessors() * 2));
    }

    public static File processImage(File file) throws IOException {
        if (file == null || !file.exists() || !file.canRead()) {
            throw new IOException("Invalid input file: " + (file != null ? file.getAbsolutePath() : "null"));
        }

        if (file.length() == 0) {
            throw new IOException("Empty input file: " + file.getAbsolutePath());
        }

        BufferedImage originalImage;
        try {
            originalImage = ImageIO.read(file);
        } catch (IIOException e) {
            throw new IOException("Failed to read image file: " + file.getAbsolutePath(), e);
        }

        if (originalImage == null) {
            throw new IOException("Unsupported image format: " + file.getAbsolutePath());
        }

        // Ensure output directory exists
        Path outputDir = Path.of("output_images");
        if (!Files.exists(outputDir)) {
            Files.createDirectories(outputDir);
        }

        // Generate output file path
        String fileNameWithoutExt = file.getName().replaceAll("\\.[^.]+$", ""); // Remove any extension
        Path outputFilePath = outputDir.resolve("resized_" + fileNameWithoutExt + ".png");
        File resizedFile = outputFilePath.toFile();

        // Resize image
        try (OutputStream os = new FileOutputStream(resizedFile)) {
            Thumbnails.of(originalImage)
                    .size(600, 600)
                    .outputFormat("png")
//                    .outputQuality(0.9)
                    .toOutputStream(os);
        }

        return resizedFile;
    }


    @Override
    public FileUploadVO uploadImage(File file, String fileNamePrefix, EFileFolder fileFolder) {
        File resizedFile = null;
        try {
            resizedFile = processImage(file);
            String uniqueFileName = fileNamePrefix + UUID.randomUUID() + "_" + resizedFile.getName();
            String destinationPath = fileFolder.getValue() + "/" + uniqueFileName;

            BlobId blobId = BlobId.of(bucketName, destinationPath);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType("image/png")
                    .build();

            Blob blob = storage.create(blobInfo, Files.readAllBytes(resizedFile.toPath()));
            blob.createAcl(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER));
            
            String imageUrl = String.format("https://storage.googleapis.com/%s/%s", bucketName, destinationPath);
            return new FileUploadVO(200, "Upload successful", blob.getSize(), blob.getName(), blob.getBlobId().getName(), imageUrl);
        } catch (IOException e) {
            log.error("Failed to upload image: {}", e.getMessage());
            return new FileUploadVO(500, "Failed to upload to GCS or IO problem", 0L, "Failed", "", e.toString());
        } finally {
            boolean deleted = file.delete() && (resizedFile != null && resizedFile.delete());
            if (!deleted) {
                log.warn("Failed to delete temporary files for: {}", file.getName());
            }
        }
    }

    @Override
    public FileUploadVO uploadFile(File file, String fileNamePrefix, EFileFolder fileFolder) {
        try {
            String uniqueFileName = fileNamePrefix + UUID.randomUUID() + "_" + file.getName();
            String destinationPath = fileFolder.getValue() + "/" + uniqueFileName;

            String mimeType = Files.probeContentType(file.toPath());
            if (mimeType == null) {
                mimeType = "application/octet-stream";
            }

            BlobId blobId = BlobId.of(bucketName, destinationPath);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(mimeType)
                    .build();

            Blob blob = storage.create(blobInfo, Files.readAllBytes(file.toPath()));
            blob.createAcl(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER));

            String fileUrl = String.format("https://storage.googleapis.com/%s/%s", bucketName, destinationPath);
            return new FileUploadVO(200, "Upload successful", blob.getSize(), blob.getName(), blob.getBlobId().getName(), fileUrl);
        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage());
            return new FileUploadVO(500, "Failed to upload to GCS or IO problem", 0L, "Failed", "", e.toString());
        } finally {
            boolean deleted = file.delete();
            if (!deleted) {
                log.warn("Original file deletion failed: {}", file.getName());
            }
        }
    }

    @Override
    public List<FileUploadVO> uploadListFiles(List<File> files, String fileNamePrefix, EFileFolder fileFolder,
                                              UploadFileInterface<File, String, EFileFolder, FileUploadVO> uploadMethod) {
        if (files == null || files.isEmpty()) {
            log.info("No files provided for upload");
            return Collections.emptyList();
        }

        // Parallel upload using CompletableFuture with shared ExecutorService
        List<CompletableFuture<FileUploadVO>> futures = files.stream()
                .map(file -> CompletableFuture.supplyAsync(() -> {
                    try {
                        return uploadMethod.apply(file, fileNamePrefix, fileFolder);
                    } catch (Exception e) {
                        log.error("Failed to upload file {}: {}", file.getName(), e.getMessage());
                        return new FileUploadVO(500, "Failed to upload: " + e.getMessage(), 0L, file.getName(), "", "");
                    }
                }, executorService))
                .toList();

        // Wait for all uploads to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        // Collect results
        return futures.stream()
                .map(future -> {
                    try {
                        return future.get();
                    } catch (Exception e) {
                        log.error("Error retrieving upload result: {}", e.getMessage());
                        return new FileUploadVO(500, "Failed to retrieve result: " + e.getMessage(), 0L, "Unknown", "", "");
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public FileUploadVO deleteUploadedImage(String fileId) {
        try {
            storage.delete(BlobId.of(bucketName, fileId));
            log.info("File deleted successfully: {}", fileId);
            return new FileUploadVO(200, "File deleted successfully", 0L, "Deleted", fileId, "File deleted successfully.");
        } catch (Exception e) {
            log.error("Failed to delete file: {}", e.getMessage());
            return new FileUploadVO(500, "Failed to delete file", 0L, fileId, "Failed", e.getMessage());
        }
    }

    @Override
    public List<File> convertMultiPartFileToFile(List<MultipartFile> list) throws IOException {
        List<File> res = new ArrayList<>();
        if (list == null) {
            log.info("Multipart file list is null");
            return res;
        }
        for (MultipartFile multipartFile : list) {
            if (multipartFile != null && !multipartFile.isEmpty()) {
                File tempFile = File.createTempFile("temp", null);
                multipartFile.transferTo(tempFile);
                res.add(tempFile);
            }
        }
        return res;
    }

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down executor service");
        executorService.shutdown();
    }
}