package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.exception.BadRequestException;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service

public class FileStorageService {
    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    private static final List<String> ALLOWED_CONTENT_TYPES =
        List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public FileStorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file, String folder) {
        validateFile(file);
        String key = folder + "/" + UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
        try {
            PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();
            s3Client.putObject(req, RequestBody.fromBytes(file.getBytes()));
            String url = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
            log.info("File uploaded to S3: {}", url);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains(bucketName)) return;
        String key = fileUrl.substring(fileUrl.indexOf(bucketName) + bucketName.length() + 1);
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
            log.info("File deleted from S3: {}", key);
        } catch (Exception e) {
            log.warn("Failed to delete S3 file {}: {}", key, e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPEG, PNG, WebP, or GIF images are allowed");
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
