# Simple Payload CRM Example

This example demonstrates how to build a comprehensive Customer Relationship Management (CRM) system using Simple Payload. It showcases how to model complex business relationships and data structures common in CRM applications, focusing on simple-payload as an agnostic data modeling and access layer.

## Features

This CRM example includes the following collections:

- **Contacts**: Store information about leads, customers, partners, and vendors
- **Companies**: Track company details, industry, size, and relationships
- **Deals**: Manage sales opportunities through various stages
- **Products**: Catalog products or services offered
- **Activities**: Log interactions like calls, emails, meetings, and tasks
- **Users**: Manage CRM users with different roles and departments
- **Tags**: Categorize and label entities throughout the system
- **Reports**: Save and run custom reports

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)

### Installation

1. Clone the repository
2. Navigate to the example directory: `cd examples/crm-example`
3. Install dependencies: `npm install`
4. Copy the environment file: `cp .env.example .env`
5. Update the `.env` file with your MongoDB connection string and secret key

### Running the Example

Run the example with:

```bash
npm start
```

This will:
1. Set up the CRM data model
2. Create sample data including users, contacts, companies, deals, activities, etc.
3. Perform example queries to demonstrate how to retrieve data

## Data Model

The CRM example demonstrates how to model complex business relationships including:

- One-to-many relationships (e.g., a company has many contacts)
- Many-to-many relationships (e.g., deals can have multiple products)
- Reverse relationships (e.g., viewing all deals associated with a contact)
- Nested data structures (e.g., company address)
- Select fields with predefined options (e.g., deal stages, contact types)

## Example Queries

The example includes several queries that demonstrate how to:

- Find high-value deals using tags
- Find all activities for a specific contact
- Find deals in a specific stage
- Find contacts assigned to a specific user

## Extending the Example

You can extend this example by:

- Adding more collections or fields to the data model
- Integrating with your preferred frontend or backend framework
- Implementing custom business logic
- Adding validation rules and access control
- Creating advanced queries and data aggregations
- Building reporting and analytics features
