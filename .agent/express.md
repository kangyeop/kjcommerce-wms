# Express.js Best Practices

## Architecture Structure

### Controller Layer
- Use controller classes for related route handlers
- Implement static methods for route handlers
- Always use TypedRequest and TypedResponse for type safety in controllers
- Define specific request types for each controller method (e.g., CreateUserRequest, GetUserParams)
- Keep controllers focused on request handling and response formatting
- Implement proper error handling and consistent error responses
- Always validate request inputs before processing
- Use consistent naming patterns for controller methods:
  - `get{Resource}s`: For retrieving collections
  - `get{Resource}ById`: For retrieving single resources
  - `create{Resource}`: For creating resources
  - `update{Resource}`: For updating resources
  - `delete{Resource}`: For deleting resources
  - `execute{Action}`: For executing operations

### Service Layer
- Implement service classes for business logic
- Use static methods for service functions
- Keep services focused on business logic and data operations
- Return DTOs instead of raw database models
- Implement proper error handling with custom error types
- Use transaction management for multi-step operations
- Keep database access code contained within services

### Data Transfer Objects (DTOs)
- Define clear interface for each DTO
- Use proper typing with explicit optional fields
- Implement model-to-dto conversion functions
- Implement dto-to-model conversion functions
- Use consistent naming patterns:
  - `{Resource}Dto`: Main resource DTO
  - `Create{Resource}RequestDto`: For creation requests
  - `Update{Resource}RequestDto`: For update requests
  - `{Resource}QueryParamsDto`: For query parameters
  - `{Resource}ParamsDto`: For URL parameters

### DTO Mappers
- Implement mapper functions directly in DTO files, not in separate mapper files
- Use consistent naming patterns for mapper functions:
  - `{resource}ModelToDto`: For mapping a single model to DTO
  - `{resource}ModelsToDto`: For mapping multiple models to DTOs
  - `{resource}DtoToModel`: For mapping DTO to model
- Handle edge cases like null values and missing relations
- Use proper type annotations for input and output
- Keep mappers synchronous where possible, async only when needed
- Return properly typed DTOs matching interface definitions

### Models
- Use ORM models for database tables
- Implement proper column definitions and types
- Use snake_case for database columns
- Use camelCase for model properties
- Define proper relationships between models
- Implement proper indexing for performance

## Request Handling

### Route Parameters
- Always use TypedRequest<P, ResBody, ReqBody, Q> for all controller methods
- Always use TypedResponse<T> for all controller methods
- Define parameter interfaces for URL parameters
- Define query parameter interfaces for query strings
- Define body parameter interfaces for request bodies
- Implement interface extensions of Request and Response
- Validate all inputs before processing

### Response Formatting
- Use consistent ApiResponse interface for all responses
- Include success status in all responses
- Include error messages for failed responses
- Include pagination metadata for collection responses
- Use consistent HTTP status codes

## Error Handling

### Error Types
- Implement proper error types for different scenarios
- Use HTTP status codes appropriately:
  - 200: Success responses
  - 201: Resource creation success
  - 202: Accepted (for async operations)
  - 400: Bad request (client error)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Resource not found
  - 500: Server errors
- Provide helpful error messages for client

### Error Structure
- Include consistent error response format:
  ```typescript
  {
    success: false,
    error: 'Error message'
  }
  ```
- Log detailed errors on server
- Send sanitized error messages to client

## Async Operations

### Queue Management
- Use job queues for long-running operations
- Implement proper job status tracking
- Return job IDs for asynchronous operations
- Implement endpoints for checking job status
- Use proper error handling for background jobs

### Request Flow
- Return immediate acknowledgements for async operations
- Provide endpoints to check operation status
- Use proper state management for multi-step operations
- Implement retry mechanisms for failed operations

## Middleware Usage

### Application Middleware
- Implement logging middleware
- Use CORS middleware for browser security
- Implement security middlewares (helmet, etc.)
- Use compression middleware for performance
- Implement request ID generation for tracing

### Route Middleware
- Use authentication middleware for protected routes
- Implement validation middleware
- Use rate limiting for API protection
- Implement proper error handling middleware
- Use transaction middleware where appropriate

## Security Best Practices

### Authentication & Authorization
- Implement proper authentication checks
- Use JWT or other token-based authentication
- Implement role-based access control
- Validate user permissions for sensitive operations
- Use secure password storage with proper hashing

### Input Validation
- Validate all request inputs
- Sanitize inputs to prevent injection attacks
- Use schema validation libraries
- Implement type checking for all inputs
- Validate business rules before processing

### Output Sanitization
- Remove sensitive data from responses
- Implement proper CORS headers
- Use content security policies
- Implement rate limiting
- Use proper error handling to avoid information leakage

## Performance Optimization

### Database Operations
- Use connection pooling
- Implement proper indexing
- Use batch operations where appropriate
- Optimize queries for performance
- Use caching for frequent queries

### Response Optimization
- Use pagination for large collections
- Implement filtering and sorting capabilities
- Use projection to limit returned fields
- Implement proper caching headers
- Use compression for responses

## Documentation

### API Documentation
- Document all endpoints
- Include request/response examples
- Document expected errors
- Include authentication requirements
- Document rate limiting and other constraints

### Code Documentation
- Include JSDoc comments for public methods
- Document service methods and their behavior
- Document DTO structure and usage
- Include examples for complex operations
- Document error handling and recovery strategies