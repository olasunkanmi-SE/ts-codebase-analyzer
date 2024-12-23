### @regovsdk/auth-manager

### 1.0.0

#### Patch Changes

Scaffold the application

#### 1.0.1

#### Patch Changes

Create the Zod Error validation class
Create a list of Http Statuses
Create the result class

### 1.0.2

#### Patch Changes

make the sendRequest method in HttpClient public

### 1.0.3

#### Patch Changes

Create the Storage and Encryption modules

### 1.0.5

#### Patch Changes

Update the application storage manager to support non encrypted local storages

### 1.0.6

#### Patch Changes

Updated EncryptionService to allow optional encryption key Updated ApplicationStorageManager to pass optional encryption key to EncryptionService

### 1.0.7

#### Feature Changes

- Introduced SecurePersistentCache class for secure system keychain storage
- Implemented cache management methods: set, get, remove, clear, and loadFromKeyChain
- Updated StorageManager for robust error handling

### 1.0.8

#### Feature changes

fix(http): Improve error handling in HTTP requests

- Wrap JSON parsing in a try-catch block to handle parsing errors
- Throw errors after logging and rejecting the promise
- Add error logging with request details

### 1.0.12

#### Feature changes

- feat(infrastructure): Add environment variable manager
- Introduce EnvManager class to manage environment variables
- Load environment variables from a file and store them in an object
- Provide methods to get, set, and remove environment variables
- Log errors and re-throw them during environment variable operations
- Update the environment file when environment variables change

### 1.0.13

#### Feature changes

Change fail method to accept data and optional message, removing errorCode parameter
Update constructor to reflect new properties

### 1.0.14

#### Enhance shared kernel package with new features and dependencies

- Update package version to 1.0.14
- Add express, joi, and @types/express dependencies
- Introduce new utility functions for handling API responses, logging errors, and validating request data
- Enhance logger service with colorized output and exception handling
- Add new HTTP status code enum and update existing enum to use uppercase naming convention

### 1.0.15

#### Change HTTP status code enum to object and update Result class

- Replace HTTP_STATUS_CODE enum with an object to allow for better type inference
- Update Result class to use a numeric error code instead of the HTTP_STATUS_CODE enum
- Remove unnecessary import statement in Result class

### 1.0.17

#### Update @rgxsdk/shared-kernel dependency and refactor error handling

### 1.0.18

#### feat(http-service): Add support for JWT token authentication and refactor request options handling

- Modify the http-service to handle JWT token authentication
- Refactor the request options handling to generate a header object with the required headers for API requests
- Introduce a new method `generateRequestOptions` to generate request options for API requests
- Introduce a new method `inititateRequest` to initiate a request to the server with the provided data and request type
- Update the package version to 1.0.19

### 1.0.20

#### refactor(http-service): Improve error handling and logger instantiation

### 1.0.21

#### refactor(core): Improve HTTP status code handling and exports

- Change HTTP status codes from objects to enums for better type safety.
- Remove unnecessary HTTP status code enum in constants.ts.
- Add exports for core and exception in their respective index.ts files.
- Update import statement for Joi package to lowercase 'joi' in utils.ts.

### 1.0.22

#### feat(shared-kernel/utils): Introduce Request Token Utility

Extract request token from Authorization header in getRequestToken function
Handle unauthorized responses in cases of missing or invalid token
