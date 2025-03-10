import type { Field } from 'payload/types';
import { FieldDefinition, SimpleFieldType } from '../types/index';

/**
 * Transform a simplified field type string to a Payload CMS field definition
 */
export const transformField = (name: string, fieldType: SimpleFieldType): FieldDefinition => {
  // Check if it's a join field (indicated by '<-')
  if (fieldType.startsWith('<-')) {
    // This is a join field (reverse relationship in Payload)
    const relationPath = fieldType.substring(2);
    const [collection, fieldPath] = relationPath.includes('.') 
      ? relationPath.split('.') 
      : [relationPath, undefined];
    
    return {
      type: 'join',  // Changed from 'relationship' to 'join'
      name,
      hasMany: true,
      relationTo: collection,
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [(data: any) => undefined], // Don't save this field to the database
      },
      // Maintain needed properties for schema post-processing
      sourceCollection: collection,
      sourceField: fieldPath,
    };
  }
  
  // Check if it's a many-relationship
  if (fieldType.endsWith('[]')) {
    const relationTo = fieldType.substring(0, fieldType.length - 2);
    if (relationTo === 'tags') {
      // Special case for tags
      return {
        type: 'select',
        name,
        hasMany: true,
        options: [], // Will be filled during post-processing
      };
    }
    
    return {
      type: 'relationship',
      name,
      hasMany: true,
      relationTo,
    };
  }
  
  // Check if it's a select field with pipe-separated options
  if (fieldType.includes(' | ') || fieldType.includes('|')) {
    // Split by pipe and trim whitespace
    const separator = fieldType.includes(' | ') ? ' | ' : '|';
    const options = fieldType.split(separator).map(option => option.trim());
    
    return {
      type: 'select',
      name,
      options: options.map(option => ({
        label: option,
        value: option.toLowerCase().replace(/\s+/g, '-'), // convert to kebab-case for values
      })),
    };
  }
  
  // Handle standard field types
  switch (fieldType) {
    case 'text':
      return { type: 'text', name };
    case 'richtext':
      return { type: 'richText', name };
    case 'number':
      return { type: 'number', name };
    case 'date':
      return { type: 'date', name };
    case 'email':
      return { type: 'email', name };
    case 'checkbox':
      return { type: 'checkbox', name };
    case 'json':
      return { type: 'json', name };
    case 'tags':
      return { 
        type: 'select', 
        name,
        hasMany: true,
        options: [] // Will be filled during post-processing
      };
    default:
      // Assume it's a simple relationship
      return {
        type: 'relationship',
        name,
        relationTo: fieldType,
      };
  }
};

/**
 * Convert the simplified field definitions to full Payload CMS field definitions
 */
export const processFields = (fields: Record<string, SimpleFieldType>): Field[] => {
  return Object.entries(fields).map(([fieldName, fieldType]) => {
    const fieldDef = transformField(fieldName, fieldType);
    
    // Convert to Payload field format with proper typings
    const payloadField = {
      name: fieldDef.name,
      type: fieldDef.type as any,
    } as any;
    
    // Add additional properties based on field type
    if (fieldDef.type === 'relationship') {
      (payloadField as any).relationTo = fieldDef.relationTo;
      if (fieldDef.hasMany) {
        (payloadField as any).hasMany = true;
      }
    } else if (fieldDef.type === 'join') {
      // Handle join fields (reverse relationships)
      (payloadField as any).relationTo = fieldDef.relationTo;
      if (fieldDef.hasMany) {
        (payloadField as any).hasMany = true;
      }
      (payloadField as any).admin = fieldDef.admin;
      (payloadField as any).hooks = fieldDef.hooks;
      // Preserve the sourceCollection and sourceField properties for post-processing
      (payloadField as any).sourceCollection = fieldDef.sourceCollection;
      (payloadField as any).sourceField = fieldDef.sourceField;
    } else if (fieldDef.type === 'select' && fieldDef.hasMany) {
      (payloadField as any).hasMany = true;
      (payloadField as any).options = fieldDef.options || [];
    }
    
    return payloadField;
  });
};
