// MongoDB initialization script for data governance service

db = db.getSiblingDB('data_governance_db');

// Create user with read/write permissions
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'data_governance_db'
    }
  ]
});

// Create collections with validation
db.createCollection('user_profiles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'firstName', 'lastName', 'roles'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$',
          description: 'Email must be a valid email format and is required'
        },
        firstName: {
          bsonType: 'string',
          description: 'First name must be a string and is required'
        },
        lastName: {
          bsonType: 'string',
          description: 'Last name must be a string and is required'
        },
        roles: {
          bsonType: 'array',
          minItems: 1,
          description: 'At least one role is required'
        }
      }
    }
  }
});

db.createCollection('user_preferences');
db.createCollection('user_posts');

// Create indexes
db.user_profiles.createIndex({ 'username': 1 }, { unique: true });
db.user_profiles.createIndex({ 'email': 1 }, { unique: true });
db.user_profiles.createIndex({ 'deleted': 1 });

db.user_preferences.createIndex({ 'userId': 1 }, { unique: true });
db.user_preferences.createIndex({ 'deleted': 1 });

db.user_posts.createIndex({ 'userId': 1 });
db.user_posts.createIndex({ 'deleted': 1 });
db.user_posts.createIndex({ 'userId': 1, 'deleted': 1 });

print('Database initialization completed successfully!');