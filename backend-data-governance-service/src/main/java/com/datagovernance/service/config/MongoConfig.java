package com.datagovernance.service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB configuration for enabling auditing
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // Auditing is enabled through @EnableMongoAuditing
    // This will automatically populate @CreatedDate and @LastModifiedDate fields
}