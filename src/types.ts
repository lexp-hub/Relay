export type SqlDialect = 'postgres' | 'mysql' | 'sqlite';

export type NotationMode = 'crow' | 'chen'; // Crow's foot vs Chen (Diamonds, Ovals, (min,max))

export type AttributeType = 'normal' | 'key' | 'multivalued' | 'derived' | 'composite';

export interface SubAttributeDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  defaultVal?: string;
  comment?: string;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  pk?: boolean;
  fk?: {
    targetTable: string;
    targetColumn: string;
  };
  nullable?: boolean;
  unique?: boolean;
  defaultVal?: string;
  comment?: string;
  attributeType?: AttributeType; // normal (oval), key (underlined oval), multivalued (double oval), derived (dashed oval), composite (branched tree)
  subAttributes?: SubAttributeDefinition[]; // Sub-attributes for composite attribute (e.g. Indirizzo -> Via, CAP, Città)
}

export interface TableIndex {
  name: string;
  columns: string[];
  unique?: boolean;
}

export type EntityShapeType = 'table' | 'chen_entity' | 'weak_entity' | 'associative_entity';

export interface TableDefinition {
  name: string;
  comment?: string;
  isWeak?: boolean; // Weak entity support with double border representation
  shapeType?: EntityShapeType; // Visual shape: table (standard card), chen_entity (chen rectangle), weak_entity (double border rectangle), associative_entity (diamond in box)
  columns: ColumnDefinition[];
  indices?: TableIndex[];
  color?: string; // Fill or accent styling
  strokeColor?: string; // Border / stroke styling
  textColor?: string; // Custom header / label text color
}

export interface RelationshipAttribute {
  name: string;
  type?: string;
  isKey?: boolean;
}

export interface RelationshipParticipant {
  table: string;
  column?: string;
  role?: string;
  cardinality?: '(0,1)' | '(1,1)' | '(0,N)' | '(1,N)' | string;
}

export interface RelationshipDefinition {
  id: string;
  name?: string; // Named relationship in Chen notation e.g. "SCRIVE", "PRESTITO", "HA_COPIA"
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  type: '1:1' | '1:N' | 'N:M';
  sourceCardinality?: '(0,1)' | '(1,1)' | '(0,N)' | '(1,N)'; // Chen cardinality e.g. (1,N) on source side
  targetCardinality?: '(0,1)' | '(1,1)' | '(0,N)' | '(1,N)'; // Chen cardinality e.g. (1,1) on target side
  isIdentifying?: boolean; // Identifying relationship (double diamond / double line in Chen notation)
  attributes?: RelationshipAttribute[]; // Attributes on relationships e.g. DataPrestito on PRESTITO diamond
  extraParticipants?: RelationshipParticipant[]; // Extra entities for N-Ary relationships (3+ branches)
  color?: string; // Custom fill color for diamond
  strokeColor?: string; // Custom stroke / line color for relationship and connector lines
  textColor?: string; // Custom text color for diamond title
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'RESTRICT' | 'NO ACTION';
}

export interface CanvasNote {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  title?: string;
  text: string;
  color?: 'amber' | 'slate' | 'emerald' | 'blue';
}

export interface IsaHierarchy {
  id: string;
  name?: string;
  parentTable: string; // Superclass entity name
  childTables: string[]; // Subclass entity names
  coverage: 'total' | 'partial'; // Total (double line) vs Partial (single line)
  disjointness: 'disjoint' | 'overlapping'; // Disjoint (d) vs Overlapping (o)
  x?: number; // Position on canvas
  y?: number;
  color?: string;
  strokeColor?: string;
}

export interface SchemaDefinition {
  title: string;
  description?: string;
  tables: TableDefinition[];
  relationships: RelationshipDefinition[];
  notes?: CanvasNote[];
  isaHierarchies?: IsaHierarchy[];
}

export interface SchemaTelemetry {
  tableCount: number;
  weakEntityCount: number;
  columnCount: number;
  pkCount: number;
  fkCount: number;
  uniqueCount: number;
  indexCount: number;
  normalizationLevel: string;
  cyclomaticComplexity: number;
  isaCount?: number;
  nAryRelCount?: number;
  cardinalityRatios: {
    oneToOne: number;
    oneToMany: number;
    manyToMany: number;
  };
}
