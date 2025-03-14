# Payload CMS Architecture

This document provides an overview of Payload CMS's architecture, focusing on collections and fields. Simple-payload aims to provide a simplified interface for defining Payload CMS data models while maintaining compatibility with Payload's powerful features.

## Collections

Collections are the primary way to define content structures in Payload CMS. They represent database collections and define the schema for documents stored within them.

### Collection Configuration Options

| Option | Description |
|--------|-------------|
| `slug` * | Unique, URL-friendly string that acts as an identifier for the collection |
| `fields` * | Array of field types that determine the structure and functionality of the data |
| `admin` | Configuration options for the Admin Panel |
| `access` | Access control functions to define permissions |
| `auth` | Options for collections that feature authentication |
| `hooks` | Entry point for collection hooks |
| `endpoints` | Custom routes for the REST API (set to false to disable routes) |
| `versions` | Enable document versioning |
| `timestamps` | Controls automatic createdAt and updatedAt timestamps |
| `upload` | Options for collections that support file uploads |
| `labels` | Singular and plural labels for identifying the collection |
| `defaultSort` | Field to sort by default in the Collection List View |
| `graphQL` | GraphQL-related properties for the collection |

## Fields

Fields are the building blocks of Payload. They define the schema of documents stored in the database and automatically generate the corresponding UI within the Admin Panel.

### Field Categories

Payload has three main categories of fields:

1. **Data Fields** - Store data in the database
2. **Presentational Fields** - Organize and present other fields in the Admin Panel
3. **Virtual Fields** - Display data not stored in the database

### Data Fields

| Field Type | Description |
|------------|-------------|
| `array` | For repeating content, supports nested fields |
| `blocks` | For block-based content, supports nested fields |
| `checkbox` | Saves boolean true/false values |
| `code` | Renders a code editor interface that saves a string |
| `date` | Renders a date picker and saves a timestamp |
| `email` | Ensures the value is a properly formatted email address |
| `group` | Nests fields within a keyed object |
| `json` | Renders a JSON editor interface that saves a JSON object |
| `number` | Saves numeric values |
| `point` | For location data, saves geometric coordinates |
| `radio` | Renders a radio button group that allows only one value to be selected |
| `relationship` | Assign relationships to other collections |
| `richText` | Renders a fully extensible rich text editor |
| `select` | Renders a dropdown/picklist style value selector |
| `tabs` | Similar to group, but renders nested fields within a tabbed layout |
| `text` | Simple text input that saves a string |
| `textarea` | Similar to text, but allows for multi-line input |
| `upload` | Allows local file and image upload |

### Presentational Fields

| Field Type | Description |
|------------|-------------|
| `collapsible` | Nests fields within a collapsible component |
| `row` | Aligns fields horizontally |
| `tabs` | Nests fields within a tabbed layout |
| `ui` | Blank field for custom UI components |

### Virtual Fields

| Field Type | Description |
|------------|-------------|
| `join` | Achieves two-way data binding between fields |

## Relationship Fields

Relationship fields are a powerful feature in Payload that allow you to create connections between collections.

### Relationship Configuration Options

| Option | Description |
|--------|-------------|
| `relationTo` * | Collection slug(s) to create relationships with |
| `hasMany` | When true, allows the field to have many relations instead of just one |
| `filterOptions` | Query to filter which options appear in the UI |
| `minRows` | Minimum number of related items (when hasMany is true) |
| `maxRows` | Maximum number of related items (when hasMany is true) |
| `maxDepth` | Maximum population depth for this field |

### Relationship Types

1. **Has One** - A single relationship to another document
2. **Has One (Polymorphic)** - A single relationship that can connect to multiple collection types
3. **Has Many** - Multiple relationships to other documents
4. **Has Many (Polymorphic)** - Multiple relationships that can connect to multiple collection types

## Field Common Options

Most fields in Payload share these common configuration options:

| Option | Description |
|--------|-------------|
| `name` * | Property name when stored and retrieved from the database |
| `label` | Text used as field label in the Admin Panel |
| `required` | Whether the field is required |
| `unique` | Enforce unique values for this field |
| `validate` | Custom validation function |
| `index` | Build a database index for this field |
| `hooks` | Field-level hooks |
| `access` | Field-level access control |
| `defaultValue` | Default value for the field |
| `localized` | Enable localization for this field |
| `admin` | Admin-specific configuration |

## Simple-payload Simplified Syntax

Simple-payload provides a simplified syntax for defining Payload CMS data models. It abstracts away much of the complexity while maintaining compatibility with Payload's powerful features.

Example of standard Payload syntax vs. simple-payload simplified syntax:

### Standard Payload Syntax

```javascript
const Posts = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true
    }
  ]
}
```

### Simple-payload Simplified Syntax

```javascript
const db = DB({
  posts: {
    title: 'text',
    content: 'richtext',
    author: 'users',
    tags: 'tags[]'
  },
  users: {
    name: 'text',
    email: 'email',
    posts: '<-posts.author'
  },
  tags: {
    name: 'text',
    posts: '<-posts.tags'
  }
})
```

The simple-payload syntax provides a more concise way to define collections and their relationships, while still leveraging the full power of Payload CMS under the hood.

## Key Features

1. **Type Inference** - Field types are inferred from the simplified syntax
2. **Automatic Relationships** - Relationships are automatically configured
3. **Reverse Relations** - Easily define reverse relations with the `<-` syntax
4. **Array Notation** - Use `[]` to indicate hasMany relationships
5. **Select Fields** - Define select options with pipe syntax (e.g., `'Draft | Published | Archived'`)

This architecture allows for rapid development of content models while maintaining the flexibility and power of Payload CMS.

## Database Providers

Payload CMS traditionally uses MongoDB as its primary database, but payload-db is designed with a more flexible approach to database connectivity.

### Provider Architecture

Payload-db implements a provider-based architecture for database connectivity. This design deliberately keeps database providers outside of the core dependency tree, enabling support for various environments including:

- Traditional Node.js servers
- Serverless environments
- Cloudflare Workers
- Browser-based applications
- Edge computing environments

### Available Providers

| Provider | Description | Environment Support |
|----------|-------------|---------------------|
| `MongoDB` | Native MongoDB connectivity for Node.js environments | Node.js servers, serverless functions |
| `PostgreSQL` | SQL database support with advanced features | Node.js servers, serverless functions |
| `SQLite` | Lightweight file-based SQL database | Node.js servers, Electron apps |
| `REST` | HTTP-based connectivity for client-side or restricted environments | Browsers, Cloudflare Workers, Edge functions |
| `Memory` | In-memory database for testing and development | All environments |
| `Custom` | Interface for implementing custom database providers | Varies by implementation |

### Provider Configuration

Database providers are configured separately from the data model definition, allowing for maximum flexibility:

```javascript
// Define data model
const db = DB({
  // Collections and fields definition
})

// Configure database connection
db.config.db = configureDatabase({
  type: 'mongodb', // or 'postgres', 'sqlite', 'rest', 'memory', etc.
  uri: process.env.DATABASE_URI,
  // Provider-specific options
})
```

### REST Provider

The REST provider is particularly important for environments where direct database access is not possible, such as browsers and Cloudflare Workers. It allows payload-db to communicate with a Payload CMS instance via HTTP requests, providing:

1. **Environment Compatibility** - Works in any JavaScript environment with fetch support
2. **Authentication** - Supports token-based authentication for secure API access
3. **Query Compatibility** - Translates payload-db queries to Payload REST API parameters
4. **Caching** - Optional request caching for improved performance

### Custom Providers

Payload-db supports custom database providers through a standardized interface. This allows for integration with any database system or API by implementing the required methods:

```javascript
class CustomDatabaseProvider {
  constructor(options) {
    // Initialize provider with options
  }
  
  async find(collection, query) {
    // Implement find logic
  }
  
  async findOne(collection, query) {
    // Implement findOne logic
  }
  
  async create(collection, data) {
    // Implement create logic
  }
  
  // Additional required methods...
}

// Register custom provider
registerDatabaseProvider('custom', CustomDatabaseProvider)
```

### SQL Database Support

Payload-db extends beyond MongoDB to support SQL databases like PostgreSQL and SQLite, offering:

1. **Schema Generation** - Automatically creates SQL tables and relationships from your data model
2. **Migration Support** - Handles schema changes with minimal disruption
3. **Query Translation** - Converts Payload queries to efficient SQL queries
4. **Relationship Management** - Manages foreign keys and join tables for relationships
5. **Performance Optimization** - Implements indexes and query optimization for SQL databases

### Benefits of Provider-Based Architecture

1. **Reduced Dependencies** - Core package remains lightweight without database-specific dependencies
2. **Universal Compatibility** - Works across various JavaScript environments
3. **Database Flexibility** - Switch between MongoDB, PostgreSQL, SQLite, or custom storage solutions
4. **Future-Proofing** - New database systems can be supported without changing the core library
5. **Testing Flexibility** - Easy to mock database operations for testing
6. **Deployment Flexibility** - Same data models can be used with different database backends depending on deployment environment
