package com.amrut.peth.stallbooker.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

@Configuration
@ConditionalOnProperty(name = "app.storage", havingValue = "s3")
public class S3Config {

    private static final Logger log = LoggerFactory.getLogger(S3Config.class);

    @Value("${aws.access-key}")
    private String accessKey;

    @Value("${aws.secret-key}")
    private String secretKey;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.bucket}")
    private String bucket;

    /** Exposed as a bean so FileStorageService can use the detected (not configured) region for URL building. */
    @Bean(name = "resolvedS3Region")
    public String resolvedS3Region() {
        AwsCredentialsProvider creds = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
        return detectBucketRegion(creds).id();
    }

    @Bean
    public S3Client s3Client() {
        AwsCredentialsProvider creds = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        Region actualRegion = Region.of(resolvedS3Region());
        log.info("Building S3 client for bucket '{}' in region '{}'", bucket, actualRegion);

        return S3Client.builder()
                .region(actualRegion)
                .credentialsProvider(creds)
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }

    /**
     * Queries GetBucketLocation via the us-east-1 global endpoint to find where
     * the bucket actually lives. Falls back to the configured region on any error
     * (e.g. placeholder credentials during development).
     */
    private Region detectBucketRegion(AwsCredentialsProvider creds) {
        try (S3Client probe = S3Client.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(creds)
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build()) {

            String loc = probe.getBucketLocation(r -> r.bucket(bucket))
                    .locationConstraintAsString();

            // us-east-1 returns empty/null string from GetBucketLocation
            Region detected = (loc == null || loc.isBlank()) ? Region.US_EAST_1 : Region.of(loc);
            if (!detected.id().equals(region)) {
                log.warn("Configured region '{}' differs from bucket's actual region '{}'. Using actual region.",
                        region, detected.id());
            }
            return detected;

        } catch (Exception e) {
            log.warn("Could not auto-detect bucket region ({}). Falling back to configured region '{}'.",
                    e.getMessage(), region);
            return Region.of(region);
        }
    }
}
