import { SimpleSchema, AdditionalConfig } from './types/index';
import { processSchema } from './utils/schemaProcessor';

/**
 * Create a collection configuration array from a simplified schema
 * 
 * @param schema The simplified schema definition
 * @param config Additional configuration options
 * @returns Array of collection configurations that can be used with Payload CMS
 */
export const DB = (schema: SimpleSchema, config: AdditionalConfig = {}) => {
  // Process the schema into Payload CMS collection configurations
  const collections = processSchema(schema);
  
  // Return the collections array and a helper to access collection references
  return {
    collections,
    collectionRefs: Object.keys(schema).reduce((acc, collectionName) => {
      acc[collectionName] = { collectionName };
      return acc;
    }, {} as Record<string, { collectionName: string }>),
  };
};

// Export types
export * from './types/index';
