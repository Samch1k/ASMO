import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Data Architect Agent - Database design, schema planning, data migration
 *
 * Capabilities:
 * - Database schema design and modeling
 * - Data migration planning and execution
 * - Database normalization and optimization
 * - Index strategy and performance tuning
 * - Data integrity and constraint design
 * - Backup and recovery strategy
 * - Data lifecycle management
 *
 * MCP Integrations:
 * - Supabase MCP (P0): Analyze and modify database schema
 * - GitHub MCP (P1): Review migration scripts
 * - Memory MCP (P2): Store database design decisions
 */
export class DataArchitectAgent extends BaseAgent {
  constructor() {
    super('data-architect', [
      'database_design',
      'schema_modeling',
      'data_migration',
      'database_normalization',
      'index_optimization',
      'data_integrity',
      'backup_recovery',
      'data_lifecycle',
      'relationship_design'
    ])
  }

  /**
   * Execute Data Architect workflow
   *
   * Process:
   * 1. Analyze current database schema via Supabase MCP
   * 2. Review existing migration scripts via GitHub MCP
   * 3. Retrieve past database design decisions from Memory MCP
   * 4. Design database schema or migration plan
   * 5. Generate SQL migration scripts
   * 6. Create schema diagram and documentation
   * 7. Store design decisions in Memory MCP
   * 8. Handoff to Developer for implementation
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🗃️  Starting Database architecture workflow...')

    try {
      // STEP 1: Analyze current schema via Supabase MCP
      this.log('Analyzing current database schema...')
      const currentSchema = await this.requestMCP('supabase', {
        action: 'list_tables',
        project_id: process.env.SUPABASE_PROJECT_ID
      })

      const tableDetails = await this.requestMCP('supabase', {
        action: 'execute_sql',
        query: `
          SELECT
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position
        `
      })

      // STEP 2: Review migration scripts via GitHub MCP
      this.log('Reviewing existing migrations...')
      const migrationFiles = await this.requestMCP('github', {
        action: 'search_code',
        query: 'path:migrations/ extension:sql',
        repo: process.env.GITHUB_REPO
      })

      // STEP 3: Retrieve past design decisions
      this.log('Retrieving past database design decisions...')
      const pastDecisions = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: state.task,
        type: 'database_design'
      })

      // STEP 4: Design database schema or migration
      this.log('Designing database schema/migration...')
      const schemaDesign = await this.designSchema(state, {
        currentSchema,
        tableDetails,
        migrationFiles,
        pastDecisions
      })

      // STEP 5: Generate SQL migration scripts
      const migrationSQL = this.extractMigrationSQL(schemaDesign)

      // STEP 6: Create artifacts
      const schemaDocument = this.createArtifact(
        'documentation',
        this.formatSchemaDocument(schemaDesign),
        {
          documentType: 'database_schema',
          timestamp: new Date().toISOString()
        }
      )

      const migrationScript = this.createArtifact(
        'code',
        migrationSQL,
        {
          language: 'sql',
          fileName: this.generateMigrationFileName(state.task),
          timestamp: new Date().toISOString()
        }
      )

      // STEP 7: Store in Memory MCP
      this.log('Storing database design decisions...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Database Design: ${state.task}`,
          entityType: 'database_design',
          observations: [schemaDocument.content]
        }]
      })

      // STEP 8: Create result and handoff
      const result = this.createResult('needs_handoff', schemaDesign, [
        schemaDocument,
        migrationScript
      ])
      result.handoffTo = 'developer'
      result.confidence = 0.9

      this.log('✅ Database design complete, handing off to Developer')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          schemaDesign,
          migrationSQL
        },
        nextAction: 'developer'
      }

    } catch (error) {
      this.log(`Error during execution: ${error}`, 'error')

      const failedResult = this.createResult('failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        agentResults: [...state.agentResults, failedResult],
        nextAction: 'END'
      }
    }
  }

  /**
   * Design database schema using Claude LLM
   */
  private async designSchema(
    state: AgentState,
    context: {
      currentSchema: any
      tableDetails: any
      migrationFiles: any
      pastDecisions: any
    }
  ): Promise<string> {
    const systemPrompt = `You are the Data Architect for MeatConnect, a B2B marketplace platform.

TECHNOLOGY STACK:
Database:
- PostgreSQL 15+ (via Supabase)
- Drizzle ORM for migrations and queries
- Connection pooling enabled
- Full-text search support
- JSON/JSONB support for flexible data
- Row-level security (RLS) enabled

DOMAIN CONTEXT:
- B2B two-sided marketplace (Buyers and Suppliers)
- Core entities: Users, Companies, Products, RFQs, Quotes, Orders
- Trust & verification workflows
- Real-time notifications
- Document/image storage (Supabase Storage)
- Audit trail for all transactions

CURRENT SCHEMA:
${JSON.stringify(context.currentSchema, null, 2)}

TABLE DETAILS:
${JSON.stringify(context.tableDetails, null, 2)}

EXISTING MIGRATIONS:
${JSON.stringify(context.migrationFiles, null, 2)}

PAST DATABASE DESIGN DECISIONS:
${JSON.stringify(context.pastDecisions, null, 2)}

TASK:
${state.task}

DESIGN DATABASE SCHEMA:

1. **Requirements Analysis**
   - What data needs to be stored?
   - What are the relationships between entities?
   - What are the access patterns?
   - What are the performance requirements?
   - What are the data integrity constraints?

2. **Entity-Relationship Design**
   For each entity:
   - Table Name: (follow naming convention: snake_case, plural)
   - Purpose: Brief description
   - Columns:
     - Column Name (type, constraints)
     - Description and purpose
   - Primary Key: id (uuid, generated by default)
   - Foreign Keys: relationships to other tables
   - Indexes: performance optimization indexes
   - Unique Constraints: business logic constraints
   - Check Constraints: data validation rules

3. **Normalization Analysis**
   - Current Normal Form: (1NF, 2NF, 3NF, BCNF)
   - Normalization Recommendations
   - Denormalization Justifications (for performance)

4. **Relationships**
   Define relationships:
   - One-to-One: (e.g., User → UserProfile)
   - One-to-Many: (e.g., Company → Products)
   - Many-to-Many: (e.g., Products ↔ Categories, via junction table)
   For each relationship:
   - Entities involved
   - Cardinality
   - Foreign key columns
   - Cascade rules (ON DELETE, ON UPDATE)

5. **Indexes Strategy**
   For each index:
   - Index Name
   - Table
   - Columns (order matters!)
   - Type: B-tree (default) / Hash / GiST / GIN
   - Purpose: Which queries benefit?
   - Estimated Impact: Query performance improvement

6. **Data Integrity**
   - Primary Keys (always required)
   - Foreign Keys (with CASCADE rules)
   - NOT NULL constraints
   - UNIQUE constraints
   - CHECK constraints (e.g., price > 0)
   - DEFAULT values

7. **Migration Plan**
   Step-by-step migration:
   - Step 1: [Description]
     SQL: [SQL statement]
     Rollback: [Rollback SQL]
   - Step 2: [Description]
     SQL: [SQL statement]
     Rollback: [Rollback SQL]
   - ...

   IMPORTANT:
   - Use transactions (BEGIN; ... COMMIT;)
   - Test rollback procedures
   - Consider downtime requirements
   - Plan for data backfill if needed

8. **SQL Migration Script**
   Generate complete, executable SQL script:

   \`\`\`sql
   -- Migration: [Brief description]
   -- Author: Data Architect Agent
   -- Date: ${new Date().toISOString().split('T')[0]}

   BEGIN;

   -- Create tables
   CREATE TABLE IF NOT EXISTS table_name (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     -- additional columns...
   );

   -- Create indexes
   CREATE INDEX IF NOT EXISTS idx_name ON table_name (column);

   -- Create foreign keys
   ALTER TABLE table_name
   ADD CONSTRAINT fk_name FOREIGN KEY (column)
   REFERENCES other_table (id) ON DELETE CASCADE;

   -- Enable RLS
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY policy_name ON table_name
   FOR SELECT USING (true);

   COMMIT;

   -- Rollback script (run if migration fails)
   -- BEGIN;
   -- DROP TABLE IF EXISTS table_name CASCADE;
   -- COMMIT;
   \`\`\`

9. **Performance Considerations**
   - Query patterns: Most frequent queries
   - Index coverage: Which indexes help these queries?
   - Partitioning strategy: For large tables (> 1M rows)
   - Materialized views: For complex aggregations
   - Connection pooling: Recommended pool size

10. **Data Lifecycle**
    - Archival strategy: Old data management
    - Soft delete vs hard delete
    - Backup frequency: Daily, weekly?
    - Data retention policy: Legal requirements

11. **Security & Compliance**
    - Row-level security (RLS) policies
    - Column-level encryption for sensitive data
    - Audit logging: Track data changes
    - GDPR compliance: PII handling

Format as a comprehensive database design document with executable SQL migration script.`

    const response = await this.callLLM(systemPrompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 4096
    })

    return response.content
  }

  /**
   * Extract SQL migration script from design
   */
  private extractMigrationSQL(design: string): string {
    // Extract SQL code blocks from design
    const sqlMatch = design.match(/```sql\n([\s\S]*?)\n```/)
    if (sqlMatch && sqlMatch[1]) {
      return sqlMatch[1].trim()
    }

    // If no SQL block found, return placeholder
    return `-- Migration SQL
-- Generated by Data Architect Agent
-- Date: ${new Date().toISOString()}

BEGIN;

-- TODO: Add migration SQL here
-- ${design.substring(0, 200).replace(/\n/g, '\n-- ')}...

COMMIT;
`
  }

  /**
   * Generate migration file name
   */
  private generateMigrationFileName(task: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const slug = task
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)

    return `${timestamp}_${slug}.sql`
  }

  /**
   * Format schema design document
   */
  private formatSchemaDocument(design: string): string {
    const timestamp = new Date().toISOString().split('T')[0]

    return `# Database Schema Design

**Date**: ${timestamp}
**Architect**: Data Architect Agent
**Database**: PostgreSQL 15+ (Supabase)
**ORM**: Drizzle

---

## Overview

This document describes the database schema design, including entity relationships, indexes, constraints, and migration plan.

---

## Detailed Design

${design}

---

## Review Checklist

Before implementing this schema:
- [ ] Entity relationships are correct and complete
- [ ] All foreign keys have appropriate CASCADE rules
- [ ] Indexes cover frequent query patterns
- [ ] RLS policies are defined for security
- [ ] Migration script is tested (locally first!)
- [ ] Rollback procedure is documented
- [ ] Performance impact is assessed
- [ ] Data integrity constraints are complete

---

**Generated by**: Data Architect Agent (ASMO Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}

**Next Steps**:
1. Review schema design with team
2. Test migration script locally (use \`supabase db reset\`)
3. Apply migration to staging environment
4. Verify data integrity and performance
5. Document any additional RLS policies needed
6. Deploy to production during low-traffic window
`
  }
}
