# payload-db

Simplified Data Schema Definition for [Payload CMS](https://payloadcms.com) applications using concise syntax.

## Overview

`payload-db` is a lightweight schema generator for Payload CMS that enables extremely concise data model definitions. This package focuses purely on transforming a simplified schema format into Payload CMS compatible configuration, making it easier to define your data models with minimal code.

## Features

- **Simplified Schema Definition** - Define your data models with minimal code
- **Relationship Management** - Easily define relationships between collections
- **Select Field Shorthand** - Define select fields with predefined options using pipe separators
- **Join Fields** - Simplified syntax for defining reverse relationships (join fields)
- **Full Payload CMS Compatibility** - Generates standard Payload CMS configuration
- **Type Safety** - Full TypeScript support for your data models
- **Minimal Dependencies** - Only depends on Payload CMS itself

## Installation

```bash
npm install payload-db
# or
yarn add payload-db
# or
pnpm add payload-db
```

## Quick Start

```javascript
// Import necessary packages
const { DB, configureDatabase } = require('payload-db');
const payload = require('payload');
const express = require('express');

// Define your schema with simplified syntax
const dbConfig = DB({
  posts: {
    title: 'text',
    content: 'richtext',
    status: 'Draft | Published | Archived', // Select field with predefined options
    contentType: 'Text | Markdown | Code | Object | Schema', // Another select field example
    tags: 'tags[]',
    author: 'authors'
  },
  tags: {
    name: 'text',
    posts: '<-posts'  // Join field to posts (reverse relation)
  },
  authors: {
    name: 'text',
    email: 'email',
    role: 'Admin | Editor | Writer', // Select field with predefined options
    posts: '<-posts.author'  // Join field to posts (reverse relation)
  }
});

// Configure your database
dbConfig.config.db = configureDatabase({
  type: 'mongodb',
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/my-database'
});

// Initialize express app
const app = express();

// Initialize Payload with the generated configuration
payload.init({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  express: app,
  config: dbConfig.config
}).then(() => {
  // Start express server
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
});
```

## Field Types

Here are the supported field types and their mappings to Payload CMS field types:

| payload-db syntax | Payload CMS field type |
|-------------------|-------------------------|
| `'text'`          | Text field              |
| `'richtext'`      | Rich Text field         |
| `'number'`        | Number field            |
| `'date'`          | Date field              |
| `'email'`         | Email field             |
| `'checkbox'`      | Checkbox field          |
| `'json'`          | JSON field              |
| `'Option1 \| Option2 \| Option3'` | Select field with options |
| `'collection'`    | Relationship field      |
| `'collection[]'`  | Relationship (hasMany)  |
| `'<-collection'`  | Join field (reverse relation) |
| `'tags'`          | Select field (hasMany)  |
| `'tags[]'`        | Array of Select fields  |

## Relationship Syntax

payload-db simplifies relationship definitions:

```javascript
const db = DB({
  posts: {
    // ... other fields
    author: 'authors', // Relationship to a single author
    relatedPosts: 'posts[]', // Relationship to multiple posts
  },
  authors: {
    // ... other fields
    posts: '<-posts.author' // Join field to posts (reverse relation)
  }
});
```

## Database Configuration

Use the `configureDatabase` helper to set up your database adapter:

```javascript
dbConfig.config.db = configureDatabase({
  type: 'mongodb', // or 'postgres', 'sqlite', 'rest'
  uri: 'your-connection-string'
});
```

You can use different database adapters:

```javascript
// MongoDB
configureDatabase({
  type: 'mongodb',
  uri: 'mongodb://localhost:27017/my-db'
});

// PostgreSQL
configureDatabase({
  type: 'postgres',
  uri: 'postgres://user:pass@localhost:5432/my-db'
});

// SQLite
configureDatabase({
  type: 'sqlite',
  uri: 'sqlite://path/to/database.sqlite'
});

// REST API (connecting to a remote Payload instance)
configureDatabase({
  type: 'rest',
  uri: 'https://api.example.com'
});
```

To use MongoDB or PostgreSQL, ensure you have installed the appropriate adapter package:

```bash
npm install @payloadcms/db-mongodb
# or
npm install @payloadcms/db-postgres
```

## Advanced Usage

You can pass additional Payload CMS configuration options:

```javascript
const dbConfig = DB({
  // Collections definition
}, {
  // Additional Payload CMS config options
  serverURL: 'http://localhost:3000',
  admin: {
    user: 'users', // Enable admin UI with users collection
  },
  // ... other Payload config options
});

// You can also access the generated config directly
const payloadConfig = dbConfig.getConfig();

// Or extract the collection configs for further customization
const { collections } = payloadConfig;
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
