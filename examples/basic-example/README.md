# simple-payload Basic Example

This example demonstrates how to use the `simple-payload` package to create a simple blog application with posts, authors, and tags using a simplified schema definition.

## Prerequisites

- Node.js 16 or higher
- MongoDB database (or modify the example to use PostgreSQL or SQLite)
- Payload CMS

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/simple-payload.git
cd simple-payload
```

2. **Build the simple-payload package**

```bash
npm install
npm run build
```

3. **Configure your database**

Create a `.env` file in this directory:

```bash
touch .env
```

Add the following content (adjust as needed for your environment):

```
MONGODB_URI=mongodb://localhost:27017/simple-payload-example
PAYLOAD_SECRET=your-secret-key-change-me
```

4. **Install dependencies and run the example**

```bash
npm install
npm start
```

This will:
1. Initialize Payload CMS with our simplified schema
2. Create sample data (authors, tags, and posts)
3. Perform queries to demonstrate the functionality
4. Start a server on port 3000 where you can access the Payload CMS admin UI

## How It Works

The example demonstrates several key concepts:

1. **Schema Definition** - Uses the simplified syntax to define posts, authors, and tags
2. **Select Fields** - Demonstrates fields with predefined options using pipe separators
3. **Join Fields** - Shows how to set up reverse relationships between collections
4. **Database Configuration** - Configures MongoDB as the database adapter
5. **Payload Integration** - Shows how to use the generated schema with Payload CMS

## Understanding the Example

This example demonstrates:

1. **Simplified Schema Definition** - See how easy it is to define your data model using the simple-payload concise syntax
2. **Select Fields with Options** - Define select fields with predefined options using the pipe syntax
3. **Join Fields** - Define reverse relationships between collections with the `<-` syntax
4. **Schema Transformation** - See how our simplified schema gets transformed into Payload CMS configuration
5. **Payload CMS Integration** - How to use the generated schema with Payload CMS for a complete application

The main code is in `index.js` and includes detailed comments to help you understand each step.

## Next Steps

After running this example, you can try:

1. Adding more fields and collections to the schema
2. Implementing more complex relationships with join fields
3. Using different database adapters (PostgreSQL, SQLite)
4. Customizing the generated Payload configuration
5. Building a frontend to interact with your data via the Payload API
