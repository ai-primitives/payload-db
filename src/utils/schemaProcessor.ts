import type { CollectionConfig } from 'payload/types';
import { SimpleSchema, ProcessedCollection } from '../types/index';
import { processFields } from './fieldTransformer';

/**
 * Process the simplified schema into Payload CMS collection configurations
 */
export const processSchema = (schema: SimpleSchema): CollectionConfig[] => {
  // First pass: Create basic collection configs
  const collections: ProcessedCollection[] = Object.entries(schema).map(([collectionName, fields]) => {
    return {
      slug: collectionName,
      fields: processFields(fields),
    };
  });
  
  // Second pass: Process join fields (reverse relationships)
  collections.forEach(collection => {
    // Track join fields that need to be removed after processing
    const joinFieldsToRemove: string[] = [];
    
    // Find all join fields in this collection
    collection.fields.forEach((field: any) => {
      if (field.type === 'join') {
        joinFieldsToRemove.push(field.name);
        
        // Find the target collection
        const targetCollection = collections.find(c => c.slug === field.sourceCollection);
        if (!targetCollection) return;
        
        // Find the target field in the target collection, or use the default relationship field
        let targetField: any;
        
        if (field.sourceField) {
          // Find a specific field in the target collection
          targetField = targetCollection.fields.find((f: any) => f.name === field.sourceField);
        } else {
          // Find any relationship field in the target collection that points to this collection
          targetField = targetCollection.fields.find((f: any) => 
            f.type === 'relationship' && 
            f.relationTo === collection.slug
          );
        }
        
        if (targetField) {
          // Add the field config to enable proper join behavior
          targetField.admin = targetField.admin || {};
          targetField.admin.enableRichText = true;
          targetField.fields = targetField.fields || [];
          
          // Setup the reference field properly
          targetField.fields.push({
            name: field.name,
            type: 'relationship',
            relationTo: field.relationTo,
            hasMany: true,
          });
        }
      }
    });
    
    // Remove the placeholder join fields as they're not needed anymore
    if (joinFieldsToRemove.length > 0) {
      collection.fields = collection.fields.filter((field: any) => 
        !joinFieldsToRemove.includes(field.name)
      );
    }
  });
  
  return collections as CollectionConfig[];
};
