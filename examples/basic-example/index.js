/**
 * Basic example of how to use payload-db
 */

// In a real application, you would import from the package
// const { DB, configureDatabase } = require('payload-db');
// For this example, we'll import from the local package
const { DB, configureDatabase } = require('../../dist');

// Import Payload and Express
const payload = require('payload');
const express = require('express');

// Load environment variables
require('dotenv').config();

// Define your data model using the simplified syntax
const dbConfig = DB({
  // Posts collection
  posts: {
    title: 'text',
    content: 'richtext',
    slug: 'text',
    status: 'Draft | Published | Archived', // Select field with predefined options
    contentType: 'Text | Markdown | Code | Object | Schema', // Select field with pipe syntax
    publishedDate: 'date',
    tags: 'tags[]',
    author: 'authors',
    relatedPosts: 'posts[]'
  },
  
  // Authors collection
  authors: {
    name: 'text',
    email: 'email',
    bio: 'richtext',
    role: 'Admin | Editor | Writer', // Select field with predefined options
    posts: '<-posts.author',  // Join field to posts (reverse relation)
  },
  
  // Tags collection - for categorizing posts
  tags: {
    name: 'text',
    description: 'text',
    category: 'Programming | Design | Database | DevOps | Other', // Select field with options
    posts: '<-posts',  // Join field to all posts with this tag (reverse relation)
  }
});

// Configure the database connection
dbConfig.config.db = configureDatabase({
  type: 'mongodb',
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/payload-db-example'
});

// Initialize express app
const app = express();

// Initialize Payload with our generated configuration
let payloadInstance;

// Example usage - creating and querying data
async function main() {
  try {
    // Initialize Payload first
    payloadInstance = await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'example-secret-key-change-me',
      express: app,
      config: dbConfig.config
    });
    
    console.log('Creating an author...');
    const author = await payloadInstance.create({
      collection: 'authors',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        bio: '<p>A sample author biography.</p>',
        role: 'Writer', // Using our select field option
      }
    });
    console.log(`Created author: ${author.id}`);

    console.log('Creating tags...');
    const tag1 = await payloadInstance.create({
      collection: 'tags',
      data: {
        name: 'JavaScript',
        description: 'Articles about JavaScript',
        category: 'Programming', // Using our select field option
      }
    });
    const tag2 = await payloadInstance.create({
      collection: 'tags',
      data: {
        name: 'Database',
        description: 'Database-related content',
        category: 'Database', // Using our select field option
      }
    });
    console.log(`Created tags: ${tag1.id}, ${tag2.id}`);

    console.log('Creating a post...');
    const post = await payloadInstance.create({
      collection: 'posts',
      data: {
        title: 'Getting Started with payload-db',
        content: '<p>This is a sample post created using payload-db.</p>',
        slug: 'getting-started',
        status: 'Published', // Using select option - make sure it matches one of the defined options
        contentType: 'Markdown', // Using select option
        publishedDate: new Date(),
        tags: [tag1.id, tag2.id],
        author: author.id,
      }
    });
    console.log(`Created post: ${post.id}`);

    console.log('Fetching all posts...');
    const posts = await payloadInstance.find({
      collection: 'posts',
    });
    console.log(`Found ${posts.docs.length} posts`);

    console.log('Fetching post by ID...');
    const fetchedPost = await payloadInstance.findByID({
      collection: 'posts',
      id: post.id,
    });
    console.log(`Found post: ${fetchedPost.title}`);

    // Querying by select field values
    console.log('Finding posts with Published status...');
    const publishedPosts = await payloadInstance.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' } // Note: values are stored in lowercase kebab-case
      }
    });
    console.log(`Found ${publishedPosts.docs.length} published posts`);

    console.log('Finding authors with Writer role...');
    const writers = await payloadInstance.find({
      collection: 'authors',
      where: {
        role: { equals: 'writer' } // Values are lowercase
      }
    });
    console.log(`Found ${writers.docs.length} writers`);

    // Using findOne-like query with select fields
    console.log('Finding one tag in the Programming category...');
    const programmingTags = await payloadInstance.find({
      collection: 'tags',
      where: {
        category: { equals: 'programming' }
      },
      limit: 1,
    });
    const programmingTag = programmingTags.docs[0];
    console.log(`Found tag: ${programmingTag ? programmingTag.name : 'None'}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().then(() => {
  // Start the server after the example data is created
  app.listen(3000, () => {
    console.log('Server started on port 3000');
    console.log('Example completed!');
  });
});
