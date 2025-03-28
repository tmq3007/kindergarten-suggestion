package fa.pjb.back.service.impl;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import fa.pjb.back.common.util.UploadFileInterface;
import fa.pjb.back.model.enums.FileFolderEnum;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.service.GGDriveImageService;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOException;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.security.GeneralSecurityException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class GGDriveImageServiceImpl implements GGDriveImageService {

    private static final Dotenv dotenv = Dotenv.load();
    private static final String SERVICE_ACCOUNT_KEY_PATH = dotenv.get("GOOGLE_APPLICATION_CREDENTIALS");
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private Drive driveService;

    // Caching Drive Service to avoid redundant API calls
    private Drive getDriveService() throws IOException, GeneralSecurityException {
        if (driveService == null) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(SERVICE_ACCOUNT_KEY_PATH))
                    .createScoped(Collections.singleton(DriveScopes.DRIVE));
            HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);
            driveService = new Drive.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JSON_FACTORY,
                    requestInitializer
            ).setApplicationName("KSS").build();
        }
        return driveService;
    }

    //Process resize images
    //TODO: remake this to return webp file
    private java.io.File processImage(java.io.File file) throws IOException {
        // Validate file before processing
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

        String newFileName = file.getName().replaceAll("\\.tmp$", ".png");
        java.io.File resizedFile = new java.io.File("resized_" + newFileName);

        try (OutputStream os = new FileOutputStream(resizedFile)) {
            Thumbnails.of(originalImage)
                    .size(600, 600)
                    .outputFormat("png")
                    .outputQuality(0.9)
                    .toOutputStream(os);
        }
        return resizedFile;
    }

    @Override
    public FileUploadVO uploadImage(java.io.File file, String fileNamePrefix, FileFolderEnum fileFolder) {
        java.io.File resizedFile = null;
        try {
            //Process & resize the image
            resizedFile = processImage(file);

            Drive drive = getDriveService();
            String uniqueFileName = fileNamePrefix + UUID.randomUUID() + "_" + file.getName();

            //Prepare metadata
            File fileMetaData = new File();
            fileMetaData.setName(uniqueFileName);
            fileMetaData.setParents(Collections.singletonList(fileFolder.getValue()));

            //Upload resized file
            FileContent fileContent = new FileContent("image/png", resizedFile);
            File uploadFile = drive.files().create(fileMetaData, fileContent)
                    .setFields("id, webContentLink, webViewLink, size")
                    .execute();
            // Set file permissions to be publicly viewable
            Permission permission = new Permission()
                    .setType("anyone")
                    .setRole("reader");
            drive.permissions().create(uploadFile.getId(), permission).execute();

            String imageUrl = "https://drive.google.com/thumbnail?id=" + uploadFile.getId() + "&sz=w1000";
            return new FileUploadVO(200, "Upload successful", uploadFile.getSize(), uploadFile.getName(), uploadFile.getId(), imageUrl);
        } catch (IOException | GeneralSecurityException e) {
            return new FileUploadVO(500, "Failed to connect to Google Drive or IO problem", 0L, "Failed", "", e.toString());
        } finally {
            boolean deleted = file.delete() && Objects.requireNonNull(resizedFile).delete();
        }
    }

    @Override
    public FileUploadVO uploadFile(java.io.File file, String fileNamePrefix, FileFolderEnum fileFolder) {
        try {
            Drive drive = getDriveService();
            String uniqueFileName = fileNamePrefix + UUID.randomUUID() + "_" + file.getName();

            // Determine the MIME type dynamically based on the file
            String mimeType = Files.probeContentType(file.toPath());
            if (mimeType == null) {
                // Fallback to a generic type if MIME type cannot be determined
                mimeType = "application/octet-stream";
            }

            // Prepare metadata
            File fileMetaData = new File();
            fileMetaData.setName(uniqueFileName);
            fileMetaData.setParents(Collections.singletonList(fileFolder.getValue()));

            // Upload the file with its detected MIME type
            FileContent fileContent = new FileContent(mimeType, file);
            File uploadedFile = drive.files().create(fileMetaData, fileContent)
                    .setFields("id, webContentLink, webViewLink, size")
                    .execute();

            // Set file permissions to be publicly viewable
            Permission permission = new Permission()
                    .setType("anyone")
                    .setRole("reader");
            drive.permissions().create(uploadedFile.getId(), permission).execute();

            // Use webViewLink for generic file access (thumbnail URL is image-specific)
            String fileUrl = uploadedFile.getWebViewLink();
            return new FileUploadVO(200, "Upload successful", uploadedFile.getSize(), uploadedFile.getName(), uploadedFile.getId(), fileUrl);

        } catch (IOException | GeneralSecurityException e) {
            return new FileUploadVO(500, "Failed to connect to Google Drive or IO problem", 0L, "Failed", "", e.toString());
        } finally {
            boolean deleted = file.delete();
            if (!deleted) {
                log.warn("Original file deletion failed: {}", file.getName());
            }
        }
    }

    @Override
    public List<FileUploadVO> uploadListFiles(List<java.io.File> files, String fileNamePrefix, FileFolderEnum fileFolder,
                                              UploadFileInterface<java.io.File, String, FileFolderEnum, FileUploadVO> uploadMethod) {
        List<FileUploadVO> uploadResults = Collections.synchronizedList(new ArrayList<>());

        List<CompletableFuture<FileUploadVO>> futures = files.stream()
                .map(file -> CompletableFuture.supplyAsync(
                        () -> uploadMethod.apply(file, fileNamePrefix, fileFolder), // Pass all parameters
                        Executors.newFixedThreadPool(10)
                ))
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .whenComplete((result, exception) -> {
                    if (exception != null) {
                        log.error("Error in bulk upload: {}", exception.getMessage());
                    }

                    futures.forEach(future -> {
                        try {
                            uploadResults.add(future.get());
                        } catch (Exception e) {
                            log.error("Error processing upload result: {}", e.getMessage());
                        }
                    });
                })
                .join();

        return uploadResults;
    }

    //Delete Uploaded Image
    public FileUploadVO deleteUploadedImage(String fileId) {
        try {
            Drive drive = getDriveService();
            drive.files().delete(fileId).execute();
            log.info("File deleted successfully: {}", fileId);
            return new FileUploadVO(200, "File deleted successfully", 0L, "Deleted", fileId, "File deleted successfully.");
        } catch (IOException | GeneralSecurityException e) {
            log.error("Failed to delete file: {}", e.getMessage());
            return new FileUploadVO(500, "Failed to delete file", 0L, fileId, "Failed", e.getMessage());
        }
    }

    public List<java.io.File> convertMultiPartFileToFile(List<MultipartFile> list) throws IOException {
        List<java.io.File> res = new ArrayList<>();
        assert list != null;
        for (MultipartFile multipartFile : list) {
            java.io.File tempFile = java.io.File.createTempFile("temp", null);
            multipartFile.transferTo(tempFile);
            res.add(tempFile);
        }
        return res;
    }

}

