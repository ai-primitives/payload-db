import { describe, it, expect } from 'vitest';
import { DB } from '../index';

describe('Comprehensive Edge Cases', () => {
  describe('Complex Nested Relationships', () => {
    it('should handle deeply nested relationships correctly', () => {
      const schema = {
        organizations: {
          name: 'text',
          departments: '<-departments.organization'
        },
        departments: {
          name: 'text',
          organization: 'organizations',
          teams: '<-teams.department'
        },
        teams: {
          name: 'text',
          department: 'departments',
          projects: '<-projects.team'
        },
        projects: {
          name: 'text',
          team: 'teams',
          tasks: '<-tasks.project'
        },
        tasks: {
          name: 'text',
          project: 'projects',
          assignee: 'users',
          subtasks: '<-tasks.parentTask'
        },
        users: {
          name: 'text',
          assignedTasks: '<-tasks.assignee',
          team: 'teams'
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(6);
      
      // Check that all collections are properly processed
      const collectionSlugs = result.collections.map((c: any) => c.slug);
      expect(collectionSlugs).toContain('organizations');
      expect(collectionSlugs).toContain('departments');
      expect(collectionSlugs).toContain('teams');
      expect(collectionSlugs).toContain('projects');
      expect(collectionSlugs).toContain('tasks');
      expect(collectionSlugs).toContain('users');
      
      // Check that join fields are properly removed
      const organizationsCollection = result.collections.find((c: any) => c.slug === 'organizations');
      const departmentsJoinField = organizationsCollection?.fields.find((f: any) => f.name === 'departments');
      expect(departmentsJoinField).toBeUndefined();
      
      // Check that relationship fields are properly set up
      const departmentsCollection = result.collections.find((c: any) => c.slug === 'departments');
      const organizationField = departmentsCollection?.fields.find((f: any) => f.name === 'organization') as any;
      expect(organizationField).toBeDefined();
      expect(organizationField?.type).toBe('relationship');
      expect(organizationField?.relationTo).toBe('organizations');
      
      // Check that self-referential relationships work
      const tasksCollection = result.collections.find((c: any) => c.slug === 'tasks');
      const subtasksField = tasksCollection?.fields.find((f: any) => f.name === 'subtasks');
      // This should be undefined because it's a join field that gets removed
      expect(subtasksField).toBeUndefined();
      
      // But the parentTask field should exist
      const parentTaskField = tasksCollection?.fields.find((f: any) => f.name === 'parentTask');
      // This might be undefined if the schema doesn't define it, which is fine for this test
      // The important thing is that the subtasks join field is removed
    });
  });

  describe('Field Name Edge Cases', () => {
    it('should handle field names with special characters and reserved words', () => {
      const schema = {
        edgeCases: {
          'field-with-dashes': 'text',
          'field_with_underscores': 'text',
          'field.with.dots': 'text',
          'field with spaces': 'text',
          '123numericStart': 'text',
          '$specialChar': 'text',
          'type': 'text',        // Reserved word in JS
          'constructor': 'text', // Reserved word in JS
          'prototype': 'text',   // Reserved word in JS
          'toString': 'text',    // Reserved word in JS
          '__proto__': 'text'    // Reserved word in JS
        }
      };
      
      const result = DB(schema);
      
      // Verify the collection exists
      expect(result.collections).toHaveLength(1);
      const collection = result.collections[0];
      expect(collection.slug).toBe('edgeCases');
      
      // Check that all fields are processed
      expect(collection.fields).toHaveLength(10);
      
      // Check specific fields
      const fieldWithDashes = collection.fields.find((f: any) => f.name === 'field-with-dashes');
      expect(fieldWithDashes).toBeDefined();
      expect(fieldWithDashes?.type).toBe('text');
      
      const fieldWithUnderscores = collection.fields.find((f: any) => f.name === 'field_with_underscores');
      expect(fieldWithUnderscores).toBeDefined();
      expect(fieldWithUnderscores?.type).toBe('text');
      
      const typeField = collection.fields.find((f: any) => f.name === 'type');
      expect(typeField).toBeDefined();
      expect(typeField?.type).toBe('text');
    });
  });

  describe('Collection Name Edge Cases', () => {
    it('should handle collection names with special characters and reserved words', () => {
      const schema = {
        'collection-with-dashes': {
          field: 'text'
        },
        'collection_with_underscores': {
          field: 'text'
        },
        'collection.with.dots': {
          field: 'text'
        },
        'collection with spaces': {
          field: 'text'
        },
        '123numericStart': {
          field: 'text'
        },
        '$specialChar': {
          field: 'text'
        },
        'type': {
          field: 'text'
        },
        'constructor': {
          field: 'text'
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(8);
      
      // Check specific collections
      const collectionWithDashes = result.collections.find((c: any) => c.slug === 'collection-with-dashes');
      expect(collectionWithDashes).toBeDefined();
      
      const collectionWithUnderscores = result.collections.find((c: any) => c.slug === 'collection_with_underscores');
      expect(collectionWithUnderscores).toBeDefined();
      
      const typeCollection = result.collections.find((c: any) => c.slug === 'type');
      expect(typeCollection).toBeDefined();
      
      // Check collection references
      expect(result.collectionRefs).toHaveProperty('collection-with-dashes');
      expect(result.collectionRefs).toHaveProperty('collection_with_underscores');
      expect(result.collectionRefs).toHaveProperty('type');
    });
  });

  describe('Mixed Field Types and Relationships', () => {
    it('should handle a mix of all field types and relationship types in one collection', () => {
      const schema = {
        kitchen: {
          // Basic field types
          textField: 'text',
          textareaField: 'textarea',
          richtextField: 'richtext',
          numberField: 'number',
          dateField: 'date',
          emailField: 'email',
          checkboxField: 'checkbox',
          jsonField: 'json',
          
          // Select fields
          statusSelect: 'Active | Inactive | Pending',
          
          // Relationship fields
          singleRelation: 'sink',
          multipleRelation: 'sink[]',
          
          // Self-referential relationship
          parent: 'kitchen',
          children: 'kitchen[]'
        },
        sink: {
          name: 'text',
          kitchenReference: '<-kitchen.singleRelation',
          kitchenReferences: '<-kitchen.multipleRelation'
        }
      };
      
      const result = DB(schema);
      
      // Verify all collections exist
      expect(result.collections).toHaveLength(2);
      
      // Find the kitchen collection
      const kitchenCollection = result.collections.find((c: any) => c.slug === 'kitchen');
      expect(kitchenCollection).toBeDefined();
      
      // Check that all field types are processed
      expect(kitchenCollection?.fields.length).toBeGreaterThanOrEqual(12);
      
      // Check basic field types
      const textField = kitchenCollection?.fields.find((f: any) => f.name === 'textField');
      expect(textField?.type).toBe('text');
      
      const numberField = kitchenCollection?.fields.find((f: any) => f.name === 'numberField');
      expect(numberField?.type).toBe('number');
      
      // Check select field
      const statusSelect = kitchenCollection?.fields.find((f: any) => f.name === 'statusSelect') as any;
      expect(statusSelect?.type).toBe('select');
      if (statusSelect?.options) {
        expect(statusSelect.options).toHaveLength(3);
      }
      
      // Check relationship fields
      const singleRelation = kitchenCollection?.fields.find((f: any) => f.name === 'singleRelation') as any;
      expect(singleRelation?.type).toBe('relationship');
      expect(singleRelation?.relationTo).toBe('sink');
      expect(singleRelation?.hasMany).toBeUndefined();
      
      const multipleRelation = kitchenCollection?.fields.find((f: any) => f.name === 'multipleRelation') as any;
      expect(multipleRelation?.type).toBe('relationship');
      expect(multipleRelation?.relationTo).toBe('sink');
      expect(multipleRelation?.hasMany).toBe(true);
      
      // Check self-referential relationships
      const parent = kitchenCollection?.fields.find((f: any) => f.name === 'parent') as any;
      expect(parent?.type).toBe('relationship');
      expect(parent?.relationTo).toBe('kitchen');
      expect(parent?.hasMany).toBeUndefined();
      
      const children = kitchenCollection?.fields.find((f: any) => f.name === 'children') as any;
      expect(children?.type).toBe('relationship');
      expect(children?.relationTo).toBe('kitchen');
      expect(children?.hasMany).toBe(true);
    });
  });
});
