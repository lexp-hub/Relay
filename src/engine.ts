import { SchemaDefinition, ColumnDefinition, TableDefinition, RelationshipDefinition, SqlDialect, SchemaTelemetry } from './types.js';

export const STARTER_TEMPLATES: Record<string, SchemaDefinition> = {
  ecommerce: {
    title: 'E-Commerce Platform',
    description: 'Schema for online stores, billing, items and reviews',
    tables: [
      {
        name: 'users',
        comment: 'Platform accounts and customer credentials',
        isWeak: false,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'email', type: 'varchar(255)', unique: true, nullable: false },
          { name: 'password_hash', type: 'varchar(255)', nullable: false },
          { name: 'full_name', type: 'varchar(120)', nullable: false },
          { name: 'role', type: 'varchar(32)', defaultVal: "'customer'" },
          { name: 'created_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
        ],
        indices: [
          { name: 'idx_users_email', columns: ['email'], unique: true }
        ]
      },
      {
        name: 'categories',
        comment: 'Catalog hierarchies and tags',
        isWeak: false,
        columns: [
          { name: 'id', type: 'serial', pk: true },
          { name: 'slug', type: 'varchar(80)', unique: true, nullable: false },
          { name: 'title', type: 'varchar(100)', nullable: false },
          { name: 'parent_id', type: 'integer', nullable: true, fk: { targetTable: 'categories', targetColumn: 'id' } }
        ]
      },
      {
        name: 'products',
        comment: 'Store goods, stock quantities and price points',
        isWeak: false,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'category_id', type: 'integer', nullable: false, fk: { targetTable: 'categories', targetColumn: 'id' } },
          { name: 'sku', type: 'varchar(64)', unique: true, nullable: false },
          { name: 'title', type: 'varchar(200)', nullable: false },
          { name: 'price_cents', type: 'integer', nullable: false },
          { name: 'stock_qty', type: 'integer', defaultVal: '0' },
          { name: 'is_active', type: 'boolean', defaultVal: 'true' }
        ],
        indices: [
          { name: 'idx_products_cat', columns: ['category_id'] }
        ]
      },
      {
        name: 'orders',
        comment: 'Customer transactions and shipping states',
        isWeak: false,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', nullable: false, fk: { targetTable: 'users', targetColumn: 'id' } },
          { name: 'status', type: 'varchar(40)', defaultVal: "'pending'" },
          { name: 'total_amount_cents', type: 'integer', nullable: false },
          { name: 'shipping_address', type: 'text', nullable: false },
          { name: 'placed_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      },
      {
        name: 'order_items',
        comment: 'Weak entity dependent on parent orders existence',
        isWeak: true, // Weak entity!
        columns: [
          { name: 'id', type: 'bigserial', pk: true },
          { name: 'order_id', type: 'uuid', nullable: false, fk: { targetTable: 'orders', targetColumn: 'id' } },
          { name: 'product_id', type: 'uuid', nullable: false, fk: { targetTable: 'products', targetColumn: 'id' } },
          { name: 'unit_price_cents', type: 'integer', nullable: false },
          { name: 'quantity', type: 'integer', defaultVal: '1' }
        ]
      }
    ],
    relationships: [
      { id: 'rel_1', sourceTable: 'categories', sourceColumn: 'id', targetTable: 'categories', targetColumn: 'parent_id', type: '1:N', onDelete: 'SET NULL' },
      { id: 'rel_2', sourceTable: 'categories', sourceColumn: 'id', targetTable: 'products', targetColumn: 'category_id', type: '1:N', onDelete: 'RESTRICT' },
      { id: 'rel_3', sourceTable: 'users', sourceColumn: 'id', targetTable: 'orders', targetColumn: 'user_id', type: '1:N', onDelete: 'CASCADE' },
      { id: 'rel_4', sourceTable: 'orders', sourceColumn: 'id', targetTable: 'order_items', targetColumn: 'order_id', type: '1:N', isIdentifying: true, onDelete: 'CASCADE' },
      { id: 'rel_5', sourceTable: 'products', sourceColumn: 'id', targetTable: 'order_items', targetColumn: 'product_id', type: '1:N', onDelete: 'RESTRICT' }
    ]
  },

  saas_auth: {
    title: 'Multi-Tenant SaaS & RBAC',
    description: 'Workspaces, team memberships, role permissions and API keys',
    tables: [
      {
        name: 'tenants',
        comment: 'Corporate organization workspaces',
        isWeak: false,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'name', type: 'varchar(100)', nullable: false },
          { name: 'slug', type: 'varchar(64)', unique: true, nullable: false },
          { name: 'plan', type: 'varchar(32)', defaultVal: "'free'" },
          { name: 'created_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      },
      {
        name: 'users',
        comment: 'Identities authenticated across organizations',
        isWeak: false,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'email', type: 'varchar(255)', unique: true, nullable: false },
          { name: 'password_hash', type: 'varchar(255)', nullable: false },
          { name: 'is_active', type: 'boolean', defaultVal: 'true' }
        ]
      },
      {
        name: 'memberships',
        comment: 'Weak associative entity scoped to tenants',
        isWeak: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'tenant_id', type: 'uuid', nullable: false, fk: { targetTable: 'tenants', targetColumn: 'id' } },
          { name: 'user_id', type: 'uuid', nullable: false, fk: { targetTable: 'users', targetColumn: 'id' } },
          { name: 'role', type: 'varchar(32)', defaultVal: "'member'" }
        ]
      },
      {
        name: 'api_keys',
        comment: 'Weak credentials owned directly by tenants',
        isWeak: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'tenant_id', type: 'uuid', nullable: false, fk: { targetTable: 'tenants', targetColumn: 'id' } },
          { name: 'key_hash', type: 'varchar(64)', unique: true, nullable: false },
          { name: 'label', type: 'varchar(100)', nullable: false }
        ]
      }
    ],
    relationships: [
      { id: 'rel_1', sourceTable: 'tenants', sourceColumn: 'id', targetTable: 'memberships', targetColumn: 'tenant_id', type: '1:N', isIdentifying: true, onDelete: 'CASCADE' },
      { id: 'rel_2', sourceTable: 'users', sourceColumn: 'id', targetTable: 'memberships', targetColumn: 'user_id', type: '1:N', onDelete: 'CASCADE' },
      { id: 'rel_3', sourceTable: 'tenants', sourceColumn: 'id', targetTable: 'api_keys', targetColumn: 'tenant_id', type: '1:N', isIdentifying: true, onDelete: 'CASCADE' }
    ]
  },

  blog_cms: {
    title: 'Content Publishing CMS',
    description: 'Authors, articles, categories and comments',
    tables: [
      {
        name: 'authors',
        comment: 'Writers, editors, and publication contributors',
        isWeak: false,
        columns: [
          { name: 'id', type: 'serial', pk: true },
          { name: 'pen_name', type: 'varchar(100)', nullable: false },
          { name: 'handle', type: 'varchar(60)', unique: true, nullable: false }
        ]
      },
      {
        name: 'articles',
        comment: 'Published markdown articles and metadata',
        isWeak: false,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'author_id', type: 'integer', nullable: false, fk: { targetTable: 'authors', targetColumn: 'id' } },
          { name: 'slug', type: 'varchar(140)', unique: true, nullable: false },
          { name: 'title', type: 'varchar(255)', nullable: false },
          { name: 'body_markdown', type: 'text', nullable: false },
          { name: 'published_at', type: 'timestamp', nullable: true }
        ]
      },
      {
        name: 'comments',
        comment: 'Weak entity dependent on parent article existence',
        isWeak: true,
        columns: [
          { name: 'id', type: 'bigserial', pk: true },
          { name: 'article_id', type: 'uuid', nullable: false, fk: { targetTable: 'articles', targetColumn: 'id' } },
          { name: 'commenter_name', type: 'varchar(80)', nullable: false },
          { name: 'content', type: 'text', nullable: false }
        ]
      }
    ],
    relationships: [
      { id: 'rel_1', sourceTable: 'authors', sourceColumn: 'id', targetTable: 'articles', targetColumn: 'author_id', type: '1:N', onDelete: 'RESTRICT' },
      { id: 'rel_2', sourceTable: 'articles', sourceColumn: 'id', targetTable: 'comments', targetColumn: 'article_id', type: '1:N', isIdentifying: true, onDelete: 'CASCADE' }
    ]
  },

  biblioteca: {
    title: 'Biblioteca (Library Management)',
    description: 'Classic Chen ER model matching Biblioteca.drawio with authors, books, copies and loans',
    tables: [
      {
        name: 'AUTORE',
        comment: 'Book authors and creators',
        isWeak: false,
        shapeType: 'chen_entity',
        columns: [
          { name: 'CodiceAutore', type: 'serial', pk: true, attributeType: 'key' },
          { name: 'Nome', type: 'varchar(100)', nullable: false, attributeType: 'normal' },
          { name: 'Cognome', type: 'varchar(100)', nullable: false, attributeType: 'normal' },
          { name: 'DataNascita', type: 'date', nullable: true, attributeType: 'normal' }
        ]
      },
      {
        name: 'OPERA',
        comment: 'Literary works and published titles',
        isWeak: false,
        shapeType: 'chen_entity',
        columns: [
          { name: 'ISBN', type: 'varchar(20)', pk: true, attributeType: 'key' },
          { name: 'Titolo', type: 'varchar(255)', nullable: false, attributeType: 'normal' },
          { name: 'Genere', type: 'varchar(80)', nullable: true, attributeType: 'normal' },
          { name: 'AnnoPubblicazione', type: 'integer', nullable: true, attributeType: 'normal' }
        ]
      },
      {
        name: 'COPIA',
        comment: 'Physical book copy in inventory (Weak entity identified by Opera)',
        isWeak: true,
        shapeType: 'weak_entity',
        columns: [
          { name: 'NumInventario', type: 'serial', pk: true, attributeType: 'key' },
          { name: 'ISBN', type: 'varchar(20)', nullable: false, attributeType: 'normal', fk: { targetTable: 'OPERA', targetColumn: 'ISBN' } },
          { name: 'Collocazione', type: 'varchar(50)', nullable: false, attributeType: 'normal' },
          { name: 'StatoConservazione', type: 'varchar(50)', defaultVal: "'Ottimo'", attributeType: 'normal' }
        ]
      },
      {
        name: 'STUDENTE',
        comment: 'Library registered students / borrowers',
        isWeak: false,
        shapeType: 'chen_entity',
        columns: [
          { name: 'CodiceUnivoco', type: 'varchar(20)', pk: true, attributeType: 'key' },
          { name: 'Matricola', type: 'varchar(20)', unique: true, nullable: false, attributeType: 'normal' },
          { name: 'Nome', type: 'varchar(80)', nullable: false, attributeType: 'normal' },
          { name: 'Cognome', type: 'varchar(80)', nullable: false, attributeType: 'normal' },
          { name: 'Email', type: 'varchar(150)', unique: true, nullable: false, attributeType: 'normal' }
        ]
      }
    ],
    relationships: [
      {
        id: 'rel_bib_1',
        name: 'SCRIVE',
        sourceTable: 'AUTORE',
        sourceColumn: 'CodiceAutore',
        targetTable: 'OPERA',
        targetColumn: 'ISBN',
        type: 'N:M',
        sourceCardinality: '(1,N)',
        targetCardinality: '(1,N)',
        isIdentifying: false
      },
      {
        id: 'rel_bib_2',
        name: 'HA_COPIA',
        sourceTable: 'OPERA',
        sourceColumn: 'ISBN',
        targetTable: 'COPIA',
        targetColumn: 'ISBN',
        type: '1:N',
        sourceCardinality: '(1,1)',
        targetCardinality: '(0,N)',
        isIdentifying: true,
        onDelete: 'CASCADE'
      },
      {
        id: 'rel_bib_3',
        name: 'PRESTITO',
        sourceTable: 'STUDENTE',
        sourceColumn: 'CodiceUnivoco',
        targetTable: 'COPIA',
        targetColumn: 'NumInventario',
        type: 'N:M',
        sourceCardinality: '(0,N)',
        targetCardinality: '(0,N)',
        isIdentifying: false,
        attributes: [
          { name: 'DataPrestito', type: 'date' },
          { name: 'OraPrestito', type: 'time' },
          { name: 'ScadenzaPrevista', type: 'date' },
          { name: 'DataRestituzione', type: 'date' }
        ]
      }
    ]
  }
};

export function findTablePrimaryKey(schema: SchemaDefinition, tableName: string): ColumnDefinition | undefined {
  const tbl = schema.tables.find(t => t.name === tableName);
  if (!tbl) return undefined;
  const directPk = tbl.columns.find(c => c.pk || c.attributeType === 'key');
  if (directPk) return directPk;

  const isa = (schema.isaHierarchies || []).find(h => h.childTables.includes(tableName));
  if (isa) {
    return findTablePrimaryKey(schema, isa.parentTable);
  }
  return undefined;
}

export function compileSql(schema: SchemaDefinition, dialect: SqlDialect): string {
  const lines: string[] = [];
  lines.push(`-- -----------------------------------------------------`);
  lines.push(`-- Schema: ${schema.title || 'Relay SQL Schema'}`);
  lines.push(`-- Dialect: ${dialect.toUpperCase()}`);
  lines.push(`-- Generated by RELAY Studio`);
  lines.push(`-- -----------------------------------------------------\n`);

  if (dialect === 'postgres') {
    lines.push(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n`);
  } else if (dialect === 'sqlite') {
    lines.push(`PRAGMA foreign_keys = ON;\n`);
  }

  for (const table of schema.tables) {
    const weakComment = table.isWeak ? ' [WEAK ENTITY]' : '';
    const desc = table.comment ? ` (${table.comment})` : '';

    // Check if table is a subclass in an ISA hierarchy
    const isaHierarchy = (schema.isaHierarchies || []).find(isa => isa.childTables.includes(table.name));
    let isaSuperComment = '';
    let inheritedPk: { name: string; type: string; superTable: string } | null = null;
    if (isaHierarchy) {
      isaSuperComment = ` [SUBCLASS OF ${isaHierarchy.parentTable} - ISA (${isaHierarchy.coverage.toUpperCase()}, ${isaHierarchy.disjointness.toUpperCase()})]`;
      const superPk = findTablePrimaryKey(schema, isaHierarchy.parentTable);
      if (superPk && !table.columns.some(c => c.name.toLowerCase() === superPk.name.toLowerCase())) {
        inheritedPk = { name: superPk.name, type: superPk.type, superTable: isaHierarchy.parentTable };
      }
    }

    lines.push(`-- Table: ${table.name}${weakComment}${isaSuperComment}${desc}`);
    lines.push(`CREATE TABLE IF NOT EXISTS ${escapeIdentifier(table.name, dialect)} (`);
    const colDefs: string[] = [];

    // Inherited Primary Key from ISA Superclass (if not explicitly declared)
    if (inheritedPk) {
      colDefs.push(`  ${escapeIdentifier(inheritedPk.name, dialect)} ${mapColumnType(inheritedPk.type, dialect)} PRIMARY KEY`);
    }

    for (const col of table.columns) {
      // Flatten composite attributes into individual sub-columns
      if (col.attributeType === 'composite' && col.subAttributes && col.subAttributes.length > 0) {
        for (const sub of col.subAttributes) {
          const subColName = `${col.name}_${sub.name}`;
          let subStr = `  ${escapeIdentifier(subColName, dialect)} ${mapColumnType(sub.type, dialect)}`;
          if (sub.nullable === false) subStr += ' NOT NULL';
          if (sub.defaultVal) subStr += ` DEFAULT ${mapDefaultValue(sub.defaultVal, dialect)}`;
          colDefs.push(subStr);
        }
        continue;
      }

      let cStr = `  ${escapeIdentifier(col.name, dialect)} ${mapColumnType(col.type, dialect)}`;

      if (col.pk) {
        cStr += ' PRIMARY KEY';
      }

      if (col.unique && !col.pk) {
        cStr += ' UNIQUE';
      }

      if (col.nullable === false) {
        cStr += ' NOT NULL';
      }

      if (col.defaultVal) {
        cStr += ` DEFAULT ${mapDefaultValue(col.defaultVal, dialect)}`;
      }

      colDefs.push(cStr);
    }

    // ISA Foreign Key to Superclass
    if (inheritedPk) {
      colDefs.push(`  CONSTRAINT ${escapeIdentifier(`fk_isa_${table.name}_${inheritedPk.superTable}`, dialect)} FOREIGN KEY (${escapeIdentifier(inheritedPk.name, dialect)}) REFERENCES ${escapeIdentifier(inheritedPk.superTable, dialect)} (${escapeIdentifier(inheritedPk.name, dialect)}) ON DELETE CASCADE`);
    }

    // Constraints & Foreign keys (only binary 1:1 and 1:N relations without extra participants)
    const incomingFks = schema.relationships.filter(r => r.targetTable === table.name && r.type !== 'N:M' && (!r.extraParticipants || r.extraParticipants.length === 0));
    for (const rel of incomingFks) {
      let fkStr = `  CONSTRAINT ${escapeIdentifier(`fk_${table.name}_${rel.targetColumn}`, dialect)} FOREIGN KEY (${escapeIdentifier(rel.targetColumn, dialect)}) REFERENCES ${escapeIdentifier(rel.sourceTable, dialect)} (${escapeIdentifier(rel.sourceColumn, dialect)})`;
      if (rel.onDelete) {
        fkStr += ` ON DELETE ${rel.onDelete}`;
      }
      if (rel.onUpdate) {
        fkStr += ` ON UPDATE ${rel.onUpdate}`;
      }
      colDefs.push(fkStr);
    }

    lines.push(colDefs.join(',\n'));
    lines.push(`);\n`);

    // Indices
    if (table.indices && table.indices.length > 0) {
      for (const idx of table.indices) {
        const uniqueWord = idx.unique ? 'UNIQUE ' : '';
        const colsFormatted = idx.columns.map(c => escapeIdentifier(c, dialect)).join(', ');
        lines.push(`CREATE ${uniqueWord}INDEX IF NOT EXISTS ${escapeIdentifier(idx.name, dialect)} ON ${escapeIdentifier(table.name, dialect)} (${colsFormatted});`);
      }
      lines.push('');
    }
  }

  // Compile N-ary Relationships into Associative Physical Junction Tables
  const naryRels = schema.relationships.filter(r => r.extraParticipants && r.extraParticipants.length > 0);
  for (const rel of naryRels) {
    const assocName = rel.name || `rel_${rel.sourceTable}_${rel.targetTable}`;
    lines.push(`-- N-Ary Associative Physical Junction Table: ${assocName}`);
    lines.push(`CREATE TABLE IF NOT EXISTS ${escapeIdentifier(assocName, dialect)} (`);
    const assocCols: string[] = [];
    const pkCols: string[] = [];

    // Source Table FK
    const srcPk = findTablePrimaryKey(schema, rel.sourceTable) || { name: rel.sourceColumn || 'id', type: 'integer' };
    const srcColName = `${rel.sourceTable.toLowerCase()}_${srcPk.name}`;
    assocCols.push(`  ${escapeIdentifier(srcColName, dialect)} ${mapColumnType(srcPk.type, dialect)} NOT NULL`);
    pkCols.push(escapeIdentifier(srcColName, dialect));

    // Target Table FK
    const tgtPk = findTablePrimaryKey(schema, rel.targetTable) || { name: rel.targetColumn || 'id', type: 'integer' };
    const tgtColName = `${rel.targetTable.toLowerCase()}_${tgtPk.name}`;
    assocCols.push(`  ${escapeIdentifier(tgtColName, dialect)} ${mapColumnType(tgtPk.type, dialect)} NOT NULL`);
    pkCols.push(escapeIdentifier(tgtColName, dialect));

    // Extra Participants FKs
    for (const part of rel.extraParticipants || []) {
      const partPk = findTablePrimaryKey(schema, part.table) || { name: part.column || 'id', type: 'integer' };
      const partColName = `${part.table.toLowerCase()}_${partPk.name}`;
      assocCols.push(`  ${escapeIdentifier(partColName, dialect)} ${mapColumnType(partPk.type, dialect)} NOT NULL`);
      pkCols.push(escapeIdentifier(partColName, dialect));
    }

    // Relationship attributes (e.g. Budget, Timestamp)
    if (rel.attributes && rel.attributes.length > 0) {
      for (const attr of rel.attributes) {
        assocCols.push(`  ${escapeIdentifier(attr.name, dialect)} ${mapColumnType(attr.type || 'varchar(255)', dialect)}`);
      }
    }

    // Composite Primary Key across all participant FKs
    assocCols.push(`  PRIMARY KEY (${pkCols.join(', ')})`);

    // Foreign Key Constraints
    assocCols.push(`  CONSTRAINT ${escapeIdentifier(`fk_${assocName}_${rel.sourceTable}`, dialect)} FOREIGN KEY (${escapeIdentifier(srcColName, dialect)}) REFERENCES ${escapeIdentifier(rel.sourceTable, dialect)} (${escapeIdentifier(srcPk.name, dialect)}) ON DELETE CASCADE`);
    assocCols.push(`  CONSTRAINT ${escapeIdentifier(`fk_${assocName}_${rel.targetTable}`, dialect)} FOREIGN KEY (${escapeIdentifier(tgtColName, dialect)}) REFERENCES ${escapeIdentifier(rel.targetTable, dialect)} (${escapeIdentifier(tgtPk.name, dialect)}) ON DELETE CASCADE`);

    for (const part of rel.extraParticipants || []) {
      const partPk = findTablePrimaryKey(schema, part.table) || { name: part.column || 'id', type: 'integer' };
      const partColName = `${part.table.toLowerCase()}_${partPk.name}`;
      assocCols.push(`  CONSTRAINT ${escapeIdentifier(`fk_${assocName}_${part.table}`, dialect)} FOREIGN KEY (${escapeIdentifier(partColName, dialect)}) REFERENCES ${escapeIdentifier(part.table, dialect)} (${escapeIdentifier(partPk.name, dialect)}) ON DELETE CASCADE`);
    }

    lines.push(assocCols.join(',\n'));
    lines.push(`);\n`);
  }

  return lines.join('\n');
}

export function compileMermaid(schema: SchemaDefinition): string {
  const lines: string[] = ['erDiagram'];

  for (const table of schema.tables) {
    lines.push(`    ${table.name} {`);
    for (const col of table.columns) {
      const isPk = col.pk;
      const isFk = schema.relationships.some(r => r.targetTable === table.name && r.targetColumn === col.name);
      let keyAttr = '';
      if (isPk && isFk) keyAttr = 'PK,FK';
      else if (isPk) keyAttr = 'PK';
      else if (isFk) keyAttr = 'FK';

      const sanitizedType = col.type.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`        ${sanitizedType} ${col.name} ${keyAttr}`);
    }
    lines.push(`    }`);
  }

  // ISA Hierarchies in Mermaid
  for (const isa of schema.isaHierarchies || []) {
    for (const child of isa.childTables) {
      lines.push(`    ${child} }|--|| ${isa.parentTable} : "ISA (${isa.coverage.toUpperCase()}, ${isa.disjointness.toUpperCase()})"`);
    }
  }

  for (const rel of schema.relationships) {
    let arrow = '||--o{';
    if (rel.type === '1:1') arrow = '||--||';
    if (rel.type === 'N:M') arrow = '}o--o{';
    const identifyingTag = rel.isIdentifying ? ' [identifying]' : '';
    lines.push(`    ${rel.sourceTable} ${arrow} ${rel.targetTable} : "${rel.targetColumn || rel.name || 'rel'}${identifyingTag}"`);

    // Extra participants in N-Ary relationships
    if (rel.extraParticipants && rel.extraParticipants.length > 0) {
      for (const part of rel.extraParticipants) {
        lines.push(`    ${rel.sourceTable} }o--o{ ${part.table} : "${rel.name || 'nary'} (${part.cardinality || 'N'})"`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Parse standard Mermaid erDiagram code into a SchemaDefinition with full compatibility.
 * Supports entities, attribute types, PK/FK/UK markers, comments, line styles,
 * identifying relations, and all cardinality combinations.
 */
export function parseMermaid(mermaidText: string): SchemaDefinition {
  const lines = mermaidText.split(/\r?\n/);
  let title = 'Mermaid Imported Schema';
  const tablesMap = new Map<string, TableDefinition>();
  const placeholderTables = new Set<string>();
  const relationships: RelationshipDefinition[] = [];

  let currentTable: TableDefinition | null = null;
  let inFrontmatter = false;

  for (let rawLine of lines) {
    let line = rawLine.trim();

    // 1. YAML frontmatter header (---)
    if (line === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter) {
      const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
      }
      continue;
    }

    // 2. Comments and blank lines
    if (!line || line.startsWith('%%')) {
      // Optional title extraction from top comment e.g. %% Title: Library Schema
      if (line.startsWith('%%') && !title.includes('Library') && title === 'Mermaid Imported Schema') {
        const commentTitle = line.replace(/^%%\s*(?:title\s*:\s*)?/i, '').trim();
        if (commentTitle.length > 2 && commentTitle.length < 60) {
          title = commentTitle;
        }
      }
      continue;
    }

    // 3. Diagram declaration
    if (/^erDiagram\b/i.test(line)) continue;

    // 4. Closing entity block
    if (line === '}') {
      currentTable = null;
      continue;
    }

    // 5. Inside entity attributes block
    if (currentTable) {
      if (line.startsWith('}')) {
        currentTable = null;
        continue;
      }

      // Column grammar: type name [keys] ["comment"]
      // Examples:
      //   string registrationNumber PK "The registration number"
      //   varchar(255) email UK,FK
      //   uuid id PK
      //   int(11) age
      //   string[] tags
      const colMatch = line.match(/^([a-zA-Z0-9_()\[\],]+(?:\s*\([^)]*\))?)\s+([a-zA-Z0-9_-]+)(?:\s+([a-zA-Z0-9_,\s]+))?(?:\s+"([^"]*)")?$/);
      if (colMatch) {
        const colType = colMatch[1];
        const colName = colMatch[2];
        const keyFlags = colMatch[3] ? colMatch[3].toUpperCase() : '';
        const comment = colMatch[4] || undefined;

        const isPk = /\bPK\b/.test(keyFlags);
        const isFk = /\bFK\b/.test(keyFlags);
        const isUk = /\bUK\b/.test(keyFlags);

        // Avoid duplicate column definition
        const existingCol = currentTable.columns.find(c => c.name === colName);
        if (existingCol) {
          existingCol.type = colType;
          existingCol.pk = isPk || existingCol.pk;
          existingCol.unique = isUk || existingCol.unique;
          if (comment) existingCol.comment = comment;
        } else {
          currentTable.columns.push({
            name: colName,
            type: colType,
            pk: isPk,
            unique: isUk,
            comment: comment,
            attributeType: isPk ? 'key' : 'normal'
          });
        }
      } else {
        // Fallback for single word or simple name ["comment"]
        const simpleCol = line.match(/^([a-zA-Z0-9_-]+)(?:\s+"([^"]*)")?$/);
        if (simpleCol && simpleCol[1] !== '}') {
          const colName = simpleCol[1];
          if (!currentTable.columns.some(c => c.name === colName)) {
            currentTable.columns.push({
              name: colName,
              type: 'varchar(255)',
              attributeType: 'normal',
              comment: simpleCol[2] || undefined
            });
          }
        }
      }
      continue;
    }

    // 6. Entity block opening: ENTITY_NAME { or "ENTITY NAME" {
    const tableOpenMatch = line.match(/^([a-zA-Z0-9_-]+|\"[^\"]+\")\s*\{$/);
    if (tableOpenMatch) {
      const rawName = tableOpenMatch[1].replace(/^"|"$/g, '').trim();
      let table = tablesMap.get(rawName);
      if (!table) {
        table = {
          name: rawName,
          isWeak: false,
          columns: []
        };
        tablesMap.set(rawName, table);
      } else if (placeholderTables.has(rawName)) {
        // Clear placeholder columns now that we have real columns
        table.columns = [];
        placeholderTables.delete(rawName);
      }
      currentTable = table;
      continue;
    }

    // 7. Relationship syntax:
    // ENTITY1 ARROW ENTITY2 : LABEL
    // Supports ||--o{ , ||--|| , }o--o{ , }|..|{ , |o--o| , etc.
    const relMatch = line.match(/^([a-zA-Z0-9_-]+|\"[^\"]+\")\s+([|{}o]+[-.]{2}[|{}o]+)\s+([a-zA-Z0-9_-]+|\"[^\"]+\")\s*(?::\s*(.+))?$/);
    if (relMatch) {
      const srcName = relMatch[1].replace(/^"|"$/g, '').trim();
      const arrow = relMatch[2];
      const tgtName = relMatch[3].replace(/^"|"$/g, '').trim();
      let label = relMatch[4] ? relMatch[4].trim().replace(/^"|"$/g, '') : '';

      // Register tables if not encountered yet
      if (!tablesMap.has(srcName)) {
        tablesMap.set(srcName, {
          name: srcName,
          isWeak: false,
          columns: [{ name: 'id', type: 'uuid', pk: true, attributeType: 'key' }]
        });
        placeholderTables.add(srcName);
      }
      if (!tablesMap.has(tgtName)) {
        tablesMap.set(tgtName, {
          name: tgtName,
          isWeak: false,
          columns: [{ name: 'id', type: 'uuid', pk: true, attributeType: 'key' }]
        });
        placeholderTables.add(tgtName);
      }

      // Parse arrow components: left card, line style (-- or ..), right card
      const arrowParts = arrow.match(/^([|{}o]+)([-.]{2})([|{}o]+)$/);
      let leftCardStr = '||';
      let lineSep = '--';
      let rightCardStr = 'o{';
      if (arrowParts) {
        leftCardStr = arrowParts[1];
        lineSep = arrowParts[2];
        rightCardStr = arrowParts[3];
      }

      // Map Chen cardinalities
      let sourceCard: '(0,1)' | '(1,1)' | '(0,N)' | '(1,N)' = '(1,1)';
      if (leftCardStr.includes('o') && (leftCardStr.includes('}') || leftCardStr.includes('{'))) sourceCard = '(0,N)';
      else if (leftCardStr.includes('}') || leftCardStr.includes('{')) sourceCard = '(1,N)';
      else if (leftCardStr.includes('o')) sourceCard = '(0,1)';
      else sourceCard = '(1,1)';

      let targetCard: '(0,1)' | '(1,1)' | '(0,N)' | '(1,N)' = '(0,N)';
      if (rightCardStr.includes('o') && (rightCardStr.includes('}') || rightCardStr.includes('{'))) targetCard = '(0,N)';
      else if (rightCardStr.includes('}') || rightCardStr.includes('{')) targetCard = '(1,N)';
      else if (rightCardStr.includes('o')) targetCard = '(0,1)';
      else if (rightCardStr === '||') targetCard = '(1,1)';

      // Relationship cardinality type
      const leftMany = leftCardStr.includes('}') || leftCardStr.includes('{');
      const rightMany = rightCardStr.includes('}') || rightCardStr.includes('{');
      let type: '1:1' | '1:N' | 'N:M' = '1:N';
      if (leftMany && rightMany) type = 'N:M';
      else if (!leftMany && !rightMany) type = '1:1';
      else type = '1:N';

      const isIdentifying = lineSep === '--' && (label.toLowerCase().includes('[identifying]') || label.toLowerCase().includes('identifying'));
      if (label.includes('[identifying]')) {
        label = label.replace(/\[identifying\]/gi, '').trim();
      }

      const srcTable = tablesMap.get(srcName)!;
      const tgtTable = tablesMap.get(tgtName)!;

      // Identify source PK
      const srcPkCol = srcTable.columns.find(c => c.pk)?.name || 'id';

      // Infer target column
      let tgtCol = label && !label.includes(' ') ? label : `${srcName.toLowerCase()}_id`;
      const existingTgtCol = tgtTable.columns.find(c => c.name === tgtCol || c.name === label);
      if (existingTgtCol) {
        tgtCol = existingTgtCol.name;
        existingTgtCol.fk = { targetTable: srcName, targetColumn: srcPkCol };
      }

      const relId = 'rel_' + (relationships.length + 1) + '_' + Math.random().toString(36).substring(2, 6);
      relationships.push({
        id: relId,
        name: label || (srcName + '_' + tgtName),
        sourceTable: srcName,
        sourceColumn: srcPkCol,
        targetTable: tgtName,
        targetColumn: tgtCol,
        type: type,
        sourceCardinality: sourceCard,
        targetCardinality: targetCard,
        isIdentifying: isIdentifying
      });
      continue;
    }

    // 8. Standalone entity declaration: ENTITY_NAME
    const bareTableMatch = line.match(/^([a-zA-Z0-9_-]+|\"[^\"]+\")$/);
    if (bareTableMatch) {
      const bareName = bareTableMatch[1].replace(/^"|"$/g, '').trim();
      if (!tablesMap.has(bareName)) {
        tablesMap.set(bareName, {
          name: bareName,
          isWeak: false,
          columns: [{ name: 'id', type: 'uuid', pk: true, attributeType: 'key' }]
        });
      }
    }
  }

  // Ensure all tables have at least one column
  for (const table of tablesMap.values()) {
    if (table.columns.length === 0) {
      table.columns.push({ name: 'id', type: 'uuid', pk: true, attributeType: 'key' });
    }
  }

  return {
    title: title,
    tables: Array.from(tablesMap.values()),
    relationships: relationships
  };
}

export function cleanIdentifier(str: string): string {
  if (!str) return '';
  return str.trim().replace(/^[`"\[]|[`"\]]$/g, '').split('.').pop() || '';
}

export function splitTopLevel(str: string, separator: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inQuote) {
      current += ch;
      if (ch === quoteChar && str[i - 1] !== '\\') {
        inQuote = false;
      }
    } else if (ch === "'" || ch === '"' || ch === '`') {
      inQuote = true;
      quoteChar = ch;
      current += ch;
    } else if (ch === '(') {
      depth++;
      current += ch;
    } else if (ch === ')') {
      depth--;
      current += ch;
    } else if (ch === separator && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    result.push(current.trim());
  }
  return result;
}

export function parseSqlDdl(sqlText: string): SchemaDefinition {
  // 1. Remove comments
  const cleanSql = sqlText
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  let title = 'SQL Imported Schema';
  const titleMatch = sqlText.match(/--\s*Schema:\s*([^\r\n]+)/i);
  if (titleMatch) title = titleMatch[1].trim();

  const tablesMap = new Map<string, TableDefinition & { _pendingConstraints?: Array<{ type: string; col?: string; refTable?: string; refCol?: string; onDel?: string; columns?: string[] }> }>();
  const relationships: RelationshipDefinition[] = [];

  // 2. Extract CREATE TABLE statements
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s\(]+)\s*\(/gi;
  let match: RegExpExecArray | null;

  while ((match = createTableRegex.exec(cleanSql)) !== null) {
    const rawTableName = match[1];
    const tableName = cleanIdentifier(rawTableName);
    const startIdx = match.index + match[0].length;

    let depth = 1;
    let endIdx = startIdx;
    let inQuote = false;
    let quoteChar = '';

    while (endIdx < cleanSql.length && depth > 0) {
      const ch = cleanSql[endIdx];
      if (inQuote) {
        if (ch === quoteChar && cleanSql[endIdx - 1] !== '\\') inQuote = false;
      } else if (ch === "'" || ch === '"' || ch === '`') {
        inQuote = true;
        quoteChar = ch;
      } else if (ch === '(') {
        depth++;
      } else if (ch === ')') {
        depth--;
      }
      endIdx++;
    }

    const tableBody = cleanSql.substring(startIdx, endIdx - 1);
    const entries = splitTopLevel(tableBody, ',');

    const columns: ColumnDefinition[] = [];
    const tableConstraints: Array<{ type: string; col?: string; refTable?: string; refCol?: string; onDel?: string; columns?: string[] }> = [];

    for (const entry of entries) {
      const trimmed = entry.trim();
      if (!trimmed) continue;

      // Table Constraints
      if (/^(?:CONSTRAINT\s+[^\s]+\s+)?PRIMARY\s+KEY\b/i.test(trimmed)) {
        const pkMatch = trimmed.match(/PRIMARY\s+KEY\s*\(([^\)]+)\)/i);
        if (pkMatch) {
          const pkCols = pkMatch[1].split(',').map(c => cleanIdentifier(c));
          tableConstraints.push({ type: 'PK', columns: pkCols });
        }
        continue;
      }

      if (/^(?:CONSTRAINT\s+[^\s]+\s+)?FOREIGN\s+KEY\b/i.test(trimmed)) {
        const fkMatch = trimmed.match(/FOREIGN\s+KEY\s*\(([^\)]+)\)\s*REFERENCES\s+([^\s\(]+)\s*\(([^\)]+)\)(?:\s+ON\s+DELETE\s+([A-Za-z ]+))?/i);
        if (fkMatch) {
          const srcCol = cleanIdentifier(fkMatch[1]);
          const refTable = cleanIdentifier(fkMatch[2]);
          const refCol = cleanIdentifier(fkMatch[3]);
          const onDel = fkMatch[4] ? fkMatch[4].trim().toUpperCase() : undefined;
          tableConstraints.push({ type: 'FK', col: srcCol, refTable, refCol, onDel });
        }
        continue;
      }

      if (/^(?:CONSTRAINT\s+[^\s]+\s+)?UNIQUE\b/i.test(trimmed)) {
        const uqMatch = trimmed.match(/UNIQUE\s*(?:KEY|INDEX)?\s*(?:[^\s\(]+\s*)?\(([^\)]+)\)/i);
        if (uqMatch) {
          const uqCols = uqMatch[1].split(',').map(c => cleanIdentifier(c));
          tableConstraints.push({ type: 'UNIQUE', columns: uqCols });
        }
        continue;
      }

      if (/^(?:KEY|INDEX|FULLTEXT|SPATIAL)\b/i.test(trimmed)) {
        continue;
      }

      // Column Definition: name type [modifiers]
      const colTokens = trimmed.match(/^([^\s]+)\s+([a-zA-Z0-9_()\[\],]+(?:\s*\([^)]*\))?)([\s\S]*)$/);
      if (colTokens) {
        const colName = cleanIdentifier(colTokens[1]);
        const colType = colTokens[2].trim();
        const modifiers = colTokens[3] || '';

        const isPk = /\bPRIMARY\s+KEY\b/i.test(modifiers) || /\bSERIAL\b/i.test(colType);
        const isUnique = /\bUNIQUE\b/i.test(modifiers);
        const isNullable = !/\bNOT\s+NULL\b/i.test(modifiers);

        let defaultVal: string | undefined = undefined;
        const defMatch = modifiers.match(/\bDEFAULT\s+('(?:[^']|'')*'|[^,\s\(\)]+(?:\([^\)]*\))?)/i);
        if (defMatch) {
          defaultVal = defMatch[1].trim();
        }

        let comment: string | undefined = undefined;
        const commMatch = modifiers.match(/\bCOMMENT\s+'([^']*)'/i);
        if (commMatch) {
          comment = commMatch[1];
        }

        const inlineRef = modifiers.match(/\bREFERENCES\s+([^\s\(]+)\s*\(([^\)]+)\)(?:\s+ON\s+DELETE\s+([A-Za-z ]+))?/i);
        if (inlineRef) {
          tableConstraints.push({
            type: 'FK',
            col: colName,
            refTable: cleanIdentifier(inlineRef[1]),
            refCol: cleanIdentifier(inlineRef[2]),
            onDel: inlineRef[3] ? inlineRef[3].trim().toUpperCase() : undefined
          });
        }

        columns.push({
          name: colName,
          type: colType,
          pk: isPk,
          unique: isUnique,
          nullable: isNullable,
          defaultVal: defaultVal,
          comment: comment,
          attributeType: isPk ? 'key' : 'normal'
        });
      }
    }

    for (const tc of tableConstraints) {
      if (tc.type === 'PK' && tc.columns) {
        tc.columns.forEach(pkColName => {
          const col = columns.find(c => c.name.toLowerCase() === pkColName.toLowerCase());
          if (col) {
            col.pk = true;
            col.attributeType = 'key';
          }
        });
      }
      if (tc.type === 'UNIQUE' && tc.columns) {
        tc.columns.forEach(uqColName => {
          const col = columns.find(c => c.name.toLowerCase() === uqColName.toLowerCase());
          if (col) col.unique = true;
        });
      }
    }

    tablesMap.set(tableName, {
      name: tableName,
      isWeak: false,
      columns: columns,
      _pendingConstraints: tableConstraints
    });
  }

  // 3. Extract ALTER TABLE ADD FOREIGN KEY
  const alterFkRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?([^\s]+)\s+ADD\s+(?:CONSTRAINT\s+[^\s]+\s+)?FOREIGN\s+KEY\s*\(([^\)]+)\)\s*REFERENCES\s+([^\s\(]+)\s*\(([^\)]+)\)(?:\s+ON\s+DELETE\s+([A-Za-z ]+))?/gi;
  let alterMatch: RegExpExecArray | null;
  while ((alterMatch = alterFkRegex.exec(cleanSql)) !== null) {
    const srcTable = cleanIdentifier(alterMatch[1]);
    const srcCol = cleanIdentifier(alterMatch[2]);
    const refTable = cleanIdentifier(alterMatch[3]);
    const refCol = cleanIdentifier(alterMatch[4]);
    const onDel = alterMatch[5] ? alterMatch[5].trim().toUpperCase() : undefined;

    const tableObj = tablesMap.get(srcTable);
    if (tableObj) {
      if (!tableObj._pendingConstraints) tableObj._pendingConstraints = [];
      tableObj._pendingConstraints.push({
        type: 'FK',
        col: srcCol,
        refTable: refTable,
        refCol: refCol,
        onDel: onDel
      });
    }
  }

  // 4. Build Relationships
  for (const table of tablesMap.values()) {
    const fks = (table._pendingConstraints || []).filter(c => c.type === 'FK');
    for (const fk of fks) {
      if (!fk.col || !fk.refTable || !fk.refCol) continue;
      const srcColObj = table.columns.find(c => c.name.toLowerCase() === fk.col!.toLowerCase());
      if (srcColObj) {
        srcColObj.fk = { targetTable: fk.refTable, targetColumn: fk.refCol };
      }

      if (!tablesMap.has(fk.refTable)) {
        tablesMap.set(fk.refTable, {
          name: fk.refTable,
          isWeak: false,
          columns: [{ name: fk.refCol || 'id', type: 'uuid', pk: true, attributeType: 'key' }]
        });
      }

      const isColUnique = srcColObj ? Boolean(srcColObj.unique) : false;
      const isColPk = srcColObj ? Boolean(srcColObj.pk) : false;
      const relId = 'rel_' + (relationships.length + 1) + '_' + Math.random().toString(36).substring(2, 6);

      relationships.push({
        id: relId,
        name: fk.refTable + '_' + table.name,
        sourceTable: fk.refTable,
        sourceColumn: fk.refCol,
        targetTable: table.name,
        targetColumn: fk.col,
        type: isColUnique ? '1:1' : '1:N',
        sourceCardinality: '(1,1)',
        targetCardinality: isColUnique ? '(0,1)' : '(0,N)',
        isIdentifying: isColPk,
        onDelete: (fk.onDel === 'CASCADE' || fk.onDel === 'SET NULL' || fk.onDel === 'RESTRICT' || fk.onDel === 'NO ACTION') ? fk.onDel : undefined
      });
    }
    delete table._pendingConstraints;
  }

  for (const table of tablesMap.values()) {
    if (table.columns.length === 0) {
      table.columns.push({ name: 'id', type: 'uuid', pk: true, attributeType: 'key' });
    }
  }

  return {
    title: title,
    tables: Array.from(tablesMap.values()),
    relationships: relationships
  };
}

export function compileDbml(schema: SchemaDefinition): string {
  const lines: string[] = [];

  for (const table of schema.tables) {
    const weakNote = table.isWeak ? ' [weak entity]' : '';
    lines.push(`Table ${table.name} {`);
    for (const col of table.columns) {
      const tags: string[] = [];
      if (col.pk) tags.push('pk');
      if (col.unique) tags.push('unique');
      if (col.defaultVal) tags.push(`default: \`${col.defaultVal}\``);
      if (col.comment) tags.push(`note: '${col.comment.replace(/'/g, "\\'")}'`);

      const tagPart = tags.length > 0 ? ` [${tags.join(', ')}]` : '';
      lines.push(`  ${col.name} ${col.type}${tagPart}`);
    }
    if (table.comment || table.isWeak) {
      lines.push(`  Note: '${(table.comment || '') + weakNote}'`);
    }
    lines.push(`}\n`);
  }

  for (const rel of schema.relationships) {
    let symbol = '<';
    if (rel.type === '1:1') symbol = '-';
    if (rel.type === 'N:M') symbol = '<>';
    lines.push(`Ref: ${rel.targetTable}.${rel.targetColumn} ${symbol} ${rel.sourceTable}.${rel.sourceColumn}`);

    // Extra participants in N-Ary
    if (rel.extraParticipants && rel.extraParticipants.length > 0) {
      for (const part of rel.extraParticipants) {
        lines.push(`Ref: ${part.table}.${part.column || 'id'} <> ${rel.sourceTable}.${rel.sourceColumn} // N-Ary branch`);
      }
    }
  }

  // ISA Hierarchies in DBML
  for (const isa of schema.isaHierarchies || []) {
    for (const child of isa.childTables) {
      lines.push(`Ref: ${child}.id > ${isa.parentTable}.id // ISA Specialization (${isa.coverage}, ${isa.disjointness})`);
    }
  }

  return lines.join('\n');
}

export function generateLogicalAnalysisMarkdown(schema: SchemaDefinition): string {
  const lines: string[] = [];
  lines.push(`# LOGICAL DATA MODEL ANALYSIS: ${schema.title.toUpperCase()}\n`);
  if (schema.description) {
    lines.push(`*${schema.description}*\n`);
  }

  lines.push(`## 1. ENTITIES AND ATTRIBUTES SPECIFICATION\n`);
  for (const table of schema.tables) {
    const weakBadge = table.isWeak ? ' **[WEAK ENTITY - DOUBLE BORDER]**' : '';
    lines.push(`### Entity: \`${table.name}\`${weakBadge}`);
    if (table.comment) {
      lines.push(`> Description: ${table.comment}\n`);
    }
    lines.push(`| Attribute | Type | Key | Constraints | Default | Classification |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- |`);
    for (const col of table.columns) {
      const isPk = col.pk ? 'PK' : '';
      const isFk = schema.relationships.some(r => r.targetTable === table.name && r.targetColumn === col.name) ? 'FK' : '';
      const keyLabel = (isPk && isFk) ? 'PK, FK' : (isPk || isFk || '-');
      const constraints = [
        col.nullable === false ? 'NOT NULL' : 'NULLABLE',
        col.unique ? 'UNIQUE' : ''
      ].filter(Boolean).join(', ');
      let attrClass = col.attributeType ? col.attributeType.toUpperCase() : 'NORMAL';
      if (col.subAttributes && col.subAttributes.length > 0) {
        attrClass += ` (Sub: ${col.subAttributes.map(s => s.name).join(', ')})`;
      }
      lines.push(`| \`${col.name}\` | \`${col.type}\` | ${keyLabel} | ${constraints} | \`${col.defaultVal || '-'}\` | ${attrClass} |`);
    }
    lines.push('');
  }

  lines.push(`## 2. RELATIONSHIPS AND REFERENTIAL INTEGRITY RULES\n`);
  if (schema.relationships.length === 0) {
    lines.push(`No relationships defined.`);
  } else {
    lines.push(`| Relationship | Source (Owner) | Target (FK) | Extra Entities | Cardinality | Identifying | On Delete |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
    for (const rel of schema.relationships) {
      const isIdent = rel.isIdentifying ? 'YES (Weak ID)' : 'NO';
      const extraDesc = (rel.extraParticipants && rel.extraParticipants.length > 0)
        ? rel.extraParticipants.map(p => `\`${p.table}\` (${p.cardinality || 'N'})`).join(', ')
        : '-';
      lines.push(`| \`${rel.name || rel.id}\` | \`${rel.sourceTable}.${rel.sourceColumn}\` | \`${rel.targetTable}.${rel.targetColumn}\` | ${extraDesc} | **${rel.type}** | ${isIdent} | \`${rel.onDelete || 'NO ACTION'}\` |`);
    }
  }

  if (schema.isaHierarchies && schema.isaHierarchies.length > 0) {
    lines.push(`\n## 3. GENERALIZATION / SPECIALIZATION HIERARCHIES (ISA)\n`);
    lines.push(`| Superclass | Subclasses | Coverage | Exclusivity | Visual PK Inheritance |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
    for (const isa of schema.isaHierarchies) {
      lines.push(`| \`${isa.parentTable}\` | ${isa.childTables.map(c => `\`${c}\``).join(', ')} | **${isa.coverage.toUpperCase()}** | **${isa.disjointness.toUpperCase()}** | Automatic (\`${isa.parentTable}\` PKs) |`);
    }
  }

  const telemetry = calculateTelemetry(schema);
  lines.push(`\n## 4. NORMALIZATION EVALUATION AND COMPLEXITY METRICS\n`);
  lines.push(`- **Total Entities**: ${telemetry.tableCount} (${telemetry.weakEntityCount} Weak Entities)`);
  lines.push(`- **ISA Hierarchies**: ${telemetry.isaCount || 0}`);
  lines.push(`- **Total Attributes**: ${telemetry.columnCount}`);
  lines.push(`- **Primary Keys**: ${telemetry.pkCount}`);
  lines.push(`- **Foreign Keys**: ${telemetry.fkCount}`);
  lines.push(`- **Estimated Normalization Level**: ${telemetry.normalizationLevel}`);
  lines.push(`- **McCabe Cyclomatic Complexity (M = E - V + 2P)**: ${telemetry.cyclomaticComplexity}`);
  lines.push(`- **Cardinality Ratios**: 1:1 = ${telemetry.cardinalityRatios.oneToOne}, 1:N = ${telemetry.cardinalityRatios.oneToMany}, N:M = ${telemetry.cardinalityRatios.manyToMany}`);

  return lines.join('\n');
}

export function calculateTelemetry(schema: SchemaDefinition): SchemaTelemetry {
  const tableCount = schema.tables.length;
  const weakEntityCount = schema.tables.filter(t => t.isWeak).length;
  let columnCount = 0;
  let pkCount = 0;
  let fkCount = 0;
  let uniqueCount = 0;
  let indexCount = 0;

  for (const t of schema.tables) {
    columnCount += t.columns.length;
    pkCount += t.columns.filter(c => c.pk).length;
    fkCount += t.columns.filter(c => c.fk).length;
    uniqueCount += t.columns.filter(c => c.unique).length;
    if (t.indices) indexCount += t.indices.length;
  }

  const ratios = {
    oneToOne: schema.relationships.filter(r => r.type === '1:1').length,
    oneToMany: schema.relationships.filter(r => r.type === '1:N').length,
    manyToMany: schema.relationships.filter(r => r.type === 'N:M').length
  };

  const tablesWithPk = schema.tables.filter(t => t.columns.some(c => c.pk)).length;
  let normalizationLevel = '1NF';
  if (tablesWithPk === tableCount && tableCount > 0) {
    normalizationLevel = '2NF';
    if (ratios.manyToMany === 0 || schema.tables.some(t => t.columns.filter(c => c.pk).length > 1)) {
      normalizationLevel = '3NF / BCNF';
    }
  }

  const edges = schema.relationships.length;
  const vertices = Math.max(1, tableCount);
  const cyclomatic = Math.max(1, edges - vertices + 2);
  const isaCount = (schema.isaHierarchies || []).length;
  const nAryRelCount = schema.relationships.filter(r => r.extraParticipants && r.extraParticipants.length > 0).length;

  return {
    tableCount,
    weakEntityCount,
    columnCount,
    pkCount,
    fkCount,
    uniqueCount,
    indexCount,
    normalizationLevel,
    cyclomaticComplexity: cyclomatic,
    isaCount,
    nAryRelCount,
    cardinalityRatios: ratios
  };
}

function escapeIdentifier(ident: string, dialect: SqlDialect): string {
  if (dialect === 'mysql') return `\`${ident}\``;
  return `"${ident}"`;
}

function mapColumnType(type: string, dialect: SqlDialect): string {
  const t = type.toLowerCase().trim();

  if (dialect === 'sqlite') {
    if (t.includes('serial') || t.includes('int')) return 'INTEGER';
    if (t.includes('char') || t.includes('text') || t === 'uuid' || t.includes('json')) return 'TEXT';
    if (t.includes('bool')) return 'INTEGER';
    if (t.includes('float') || t.includes('double') || t.includes('dec') || t.includes('numeric')) return 'REAL';
    if (t.includes('blob') || t.includes('bytea')) return 'BLOB';
    return 'TEXT';
  }

  if (dialect === 'mysql') {
    if (t === 'serial' || t === 'bigserial') return 'BIGINT UNSIGNED AUTO_INCREMENT';
    if (t === 'uuid') return 'VARCHAR(36)';
    if (t === 'jsonb') return 'JSON';
    if (t === 'boolean') return 'TINYINT(1)';
    if (t === 'timestamp') return 'DATETIME';
    return type;
  }

  if (t === 'serial') return 'SERIAL';
  if (t === 'bigserial') return 'BIGSERIAL';
  if (t === 'datetime') return 'TIMESTAMP';
  return type;
}

function mapDefaultValue(val: string, dialect: SqlDialect): string {
  if (dialect === 'sqlite') {
    if (val.toLowerCase().includes('uuid')) return "'00000000-0000-0000-0000-000000000000'";
  }
  if (dialect === 'mysql') {
    if (val.toLowerCase().includes('uuid')) return '(UUID())';
  }
  return val;
}
