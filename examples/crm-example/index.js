/**
 * CRM example using payload-db
 */

// In a real application, you would import from the package
// const { DB, configureDatabase } = require('payload-db')
// For this example, we'll import from the local package
const { DB, configureDatabase } = require('../../dist')

// Import Payload
const payload = require('payload')

// Load environment variables
require('dotenv').config()

// Define your CRM data model using the simplified syntax
const db = DB({
  // Contacts collection - for storing customer information
  contacts: {
    firstName: 'text',
    lastName: 'text',
    email: 'email',
    phone: 'text',
    company: 'companies',  // Relation to companies collection
    type: 'Lead | Customer | Partner | Vendor', // Contact type
    status: 'Active | Inactive | Archived',
    source: 'Website | Referral | Conference | Social Media | Other',
    leadScore: 'number',
    notes: 'richtext',
    assignedTo: 'users',  // Relation to users collection
    lastContactedDate: 'date',
    tags: 'tags[]',  // Array of tags
    deals: '<-deals.contact',  // Reverse relation to deals
    activities: '<-activities.contact'  // Reverse relation to activities
  },
  
  // Companies collection - for storing company information
  companies: {
    name: 'text',
    website: 'text',
    industry: 'Technology | Finance | Healthcare | Education | Retail | Manufacturing | Other',
    size: 'Small (1-50) | Medium (51-200) | Large (201-1000) | Enterprise (1000+)',
    annualRevenue: 'number',
    description: 'richtext',
    address: {
      street: 'text',
      city: 'text',
      state: 'text',
      zipCode: 'text',
      country: 'text'
    },
    contacts: '<-contacts.company',  // Reverse relation to contacts
    deals: '<-deals.company',  // Reverse relation to deals
    assignedTo: 'users',  // Relation to users collection
    tags: 'tags[]'  // Array of tags
  },
  
  // Deals collection - for tracking sales opportunities
  deals: {
    name: 'text',
    value: 'number',
    currency: 'USD | EUR | GBP | CAD | AUD | JPY',
    stage: 'Prospecting | Qualification | Proposal | Negotiation | Closed Won | Closed Lost',
    probability: 'number',  // Percentage chance of closing
    expectedCloseDate: 'date',
    actualCloseDate: 'date',
    contact: 'contacts',  // Relation to contacts collection
    company: 'companies',  // Relation to companies collection
    description: 'richtext',
    products: 'products[]',  // Array of products
    assignedTo: 'users',  // Relation to users collection
    activities: '<-activities.deal',  // Reverse relation to activities
    notes: 'richtext',
    tags: 'tags[]'  // Array of tags
  },
  
  // Products collection - for products or services offered
  products: {
    name: 'text',
    sku: 'text',
    price: 'number',
    currency: 'USD | EUR | GBP | CAD | AUD | JPY',
    category: 'Software | Hardware | Service | Subscription | Other',
    description: 'richtext',
    isActive: 'checkbox',
    deals: '<-deals.products'  // Reverse relation to deals
  },
  
  // Activities collection - for tracking interactions with contacts
  activities: {
    type: 'Call | Email | Meeting | Task | Note',
    subject: 'text',
    description: 'richtext',
    date: 'date',
    duration: 'number',  // Duration in minutes
    contact: 'contacts',  // Relation to contacts collection
    company: 'companies',  // Relation to companies collection
    deal: 'deals',  // Relation to deals collection
    assignedTo: 'users',  // Relation to users collection
    status: 'Planned | Completed | Canceled',
    priority: 'Low | Medium | High',
    dueDate: 'date',
    completedDate: 'date'
  },
  
  // Users collection - for CRM users/staff
  users: {
    firstName: 'text',
    lastName: 'text',
    email: 'email',
    role: 'Admin | Manager | Sales | Support',
    department: 'Sales | Marketing | Support | Operations',
    isActive: 'checkbox',
    assignedContacts: '<-contacts.assignedTo',  // Reverse relation to contacts
    assignedCompanies: '<-companies.assignedTo',  // Reverse relation to companies
    assignedDeals: '<-deals.assignedTo',  // Reverse relation to deals
    assignedActivities: '<-activities.assignedTo'  // Reverse relation to activities
  },
  
  // Tags collection - for categorizing entities
  tags: {
    name: 'text',
    description: 'text',
    color: 'text',  // For UI display purposes
    contacts: '<-contacts.tags',  // Reverse relation to contacts
    companies: '<-companies.tags',  // Reverse relation to companies
    deals: '<-deals.tags'  // Reverse relation to deals
  },
  
  // Reports collection - for saved reports
  reports: {
    name: 'text',
    description: 'text',
    type: 'Sales | Activity | Contact | Company | Performance',
    parameters: 'json',  // Stored as JSON
    createdBy: 'users',  // Relation to users collection
    isPublic: 'checkbox',
    lastRunDate: 'date'
  }
});

// Configure the database connection
// This example shows how to use different database providers

// Option 1: MongoDB
db.config.db = configureDatabase({
  type: 'mongodb',
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/payload-db-crm-example'
})

// Option 2: PostgreSQL (commented out)
/*
db.config.db = configureDatabase({
  type: 'postgres',
  uri: process.env.POSTGRES_URI || 'postgresql://user:password@localhost:5432/payload-db-crm-example'
})
*/

// Option 3: SQLite (commented out)
/*
db.config.db = configureDatabase({
  type: 'sqlite',
  uri: process.env.SQLITE_PATH || './payload-db-crm-example.sqlite'
})
*/

// Initialize Payload with our generated configuration
let payloadInstance

// Example usage - creating and querying CRM data
async function main() {
  try {
    // Initialize Payload with our configuration
    // Note: In a real application, you would initialize Payload according to your project's needs
    // This is just for demonstration purposes
    payloadInstance = await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'crm-example-secret-key-change-me',
      config: db.config
    })
    
    console.log('Creating users...');
    const salesUser = await payloadInstance.create({
      collection: 'users',
      data: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        role: 'Sales',
        department: 'Sales',
        isActive: true
      }
    });
    
    const supportUser = await payloadInstance.create({
      collection: 'users',
      data: {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@example.com',
        role: 'Support',
        department: 'Support',
        isActive: true
      }
    });
    console.log(`Created users: ${salesUser.id}, ${supportUser.id}`)

    console.log('Creating tags...');
    const highValueTag = await payloadInstance.create({
      collection: 'tags',
      data: {
        name: 'High Value',
        description: 'High-value prospects or customers',
        color: '#FF5733'
      }
    });
    
    const techIndustryTag = await payloadInstance.create({
      collection: 'tags',
      data: {
        name: 'Tech Industry',
        description: 'Companies in the technology sector',
        color: '#33A1FF'
      }
    });
    console.log(`Created tags: ${highValueTag.id}, ${techIndustryTag.id}`)

    console.log('Creating products...');
    const product1 = await payloadInstance.create({
      collection: 'products',
      data: {
        name: 'CRM Pro',
        sku: 'CRM-PRO-001',
        price: 99.99,
        currency: 'USD',
        category: 'Software',
        description: '<p>Professional CRM software with advanced features.</p>',
        isActive: true
      }
    });
    
    const product2 = await payloadInstance.create({
      collection: 'products',
      data: {
        name: 'CRM Enterprise',
        sku: 'CRM-ENT-001',
        price: 299.99,
        currency: 'USD',
        category: 'Software',
        description: '<p>Enterprise-grade CRM solution with unlimited users.</p>',
        isActive: true
      }
    });
    console.log(`Created products: ${product1.id}, ${product2.id}`)

    console.log('Creating a company...');
    const company = await payloadInstance.create({
      collection: 'companies',
      data: {
        name: 'Acme Corporation',
        website: 'https://acme.example.com',
        industry: 'Technology',
        size: 'Medium (51-200)',
        annualRevenue: 5000000,
        description: '<p>A leading technology company specializing in innovative solutions.</p>',
        address: {
          street: '123 Tech Blvd',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        assignedTo: salesUser.id,
        tags: [techIndustryTag.id, highValueTag.id]
      }
    });
    console.log(`Created company: ${company.id}`)

    console.log('Creating contacts...');
    const contact1 = await payloadInstance.create({
      collection: 'contacts',
      data: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@acme.example.com',
        phone: '(555) 123-4567',
        company: company.id,
        type: 'Customer',
        status: 'Active',
        source: 'Website',
        leadScore: 85,
        notes: '<p>Key decision maker for enterprise purchases.</p>',
        assignedTo: salesUser.id,
        lastContactedDate: new Date(),
        tags: [highValueTag.id]
      }
    });
    
    const contact2 = await payloadInstance.create({
      collection: 'contacts',
      data: {
        firstName: 'Emily',
        lastName: 'Wong',
        email: 'emily.wong@acme.example.com',
        phone: '(555) 987-6543',
        company: company.id,
        type: 'Customer',
        status: 'Active',
        source: 'Referral',
        leadScore: 70,
        notes: '<p>Technical contact for implementation.</p>',
        assignedTo: supportUser.id,
        lastContactedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        tags: [techIndustryTag.id]
      }
    });
    console.log(`Created contacts: ${contact1.id}, ${contact2.id}`)

    console.log('Creating a deal...');
    const deal = await payloadInstance.create({
      collection: 'deals',
      data: {
        name: 'Acme Enterprise CRM Implementation',
        value: 15000,
        currency: 'USD',
        stage: 'Proposal',
        probability: 70,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        contact: contact1.id,
        company: company.id,
        description: '<p>Enterprise-wide CRM implementation for Acme Corporation.</p>',
        products: [product2.id],
        assignedTo: salesUser.id,
        notes: '<p>Initial proposal sent, awaiting feedback.</p>',
        tags: [highValueTag.id]
      }
    });
    console.log(`Created deal: ${deal.id}`)

    console.log('Creating activities...');
    const activity1 = await payloadInstance.create({
      collection: 'activities',
      data: {
        type: 'Meeting',
        subject: 'Initial Requirements Gathering',
        description: '<p>Meeting to discuss CRM requirements and implementation timeline.</p>',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        duration: 60,
        contact: contact1.id,
        company: company.id,
        deal: deal.id,
        assignedTo: salesUser.id,
        status: 'Completed',
        completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      }
    });
    
    const activity2 = await payloadInstance.create({
      collection: 'activities',
      data: {
        type: 'Call',
        subject: 'Follow-up on Proposal',
        description: '<p>Call to discuss the proposal and address any questions.</p>',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        duration: 30,
        contact: contact1.id,
        company: company.id,
        deal: deal.id,
        assignedTo: salesUser.id,
        status: 'Completed',
        completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    });
    
    const activity3 = await payloadInstance.create({
      collection: 'activities',
      data: {
        type: 'Task',
        subject: 'Prepare Implementation Plan',
        description: '<p>Create detailed implementation plan for Acme Corporation.</p>',
        date: new Date(),
        contact: contact2.id,
        company: company.id,
        deal: deal.id,
        assignedTo: supportUser.id,
        status: 'Planned',
        priority: 'High',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });
    console.log(`Created activities: ${activity1.id}, ${activity2.id}, ${activity3.id}`)

    console.log('Creating a report...');
    const report = await payloadInstance.create({
      collection: 'reports',
      data: {
        name: 'Q2 Sales Pipeline',
        description: 'Analysis of Q2 sales pipeline by stage and value',
        type: 'Sales',
        parameters: JSON.stringify({
          timeframe: 'Q2',
          groupBy: 'stage',
          metrics: ['value', 'count', 'probability']
        }),
        createdBy: salesUser.id,
        isPublic: true,
        lastRunDate: new Date()
      }
    });
    console.log(`Created report: ${report.id}`)

    // Example queries
    console.log('\nPerforming example queries:');
    
    console.log('\nFinding high-value deals...');
    const highValueDeals = await payloadInstance.find({
      collection: 'deals',
      where: {
        tags: { contains: highValueTag.id }
      }
    });
    console.log(`Found ${highValueDeals.docs.length} high-value deals`)
    
    console.log('\nFinding all activities for a specific contact...');
    const contactActivities = await payloadInstance.find({
      collection: 'activities',
      where: {
        contact: { equals: contact1.id }
      }
    });
    console.log(`Found ${contactActivities.docs.length} activities for contact ${contact1.firstName} ${contact1.lastName}`)
    
    console.log('\nFinding all deals in the Proposal stage...');
    const proposalDeals = await payloadInstance.find({
      collection: 'deals',
      where: {
        stage: { equals: 'proposal' } // Note: values are stored in lowercase
      }
    });
    console.log(`Found ${proposalDeals.docs.length} deals in the Proposal stage`)
    
    console.log('\nFinding all contacts assigned to a specific user...');
    const userContacts = await payloadInstance.find({
      collection: 'contacts',
      where: {
        assignedTo: { equals: salesUser.id }
      }
    });
    console.log(`Found ${userContacts.docs.length} contacts assigned to ${salesUser.firstName} ${salesUser.lastName}`)

  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the example
main().then(() => {
  console.log('CRM example completed!')
}).catch(error => {
  console.error('Error running CRM example:', error)
})
