import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes/index.js'

export default defineConfig({
  name: 'sanityhuang1988pioneer',
  title: 'Sanity Huang 1988 Pioneer',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'replace-with-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool(),
    visionTool()
  ],
  schema: {
    types: schemaTypes
  }
})
