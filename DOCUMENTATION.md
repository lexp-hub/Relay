# Relay Technical Documentation

Relay is a standalone Entity-Relationship (ER) diagramming and relational database schema modeling studio. It provides visual tooling aligned with draw.io modeling workflows, direct multi-dialect DDL compilation, and automated Microsoft Word (.docx) technical report generation.

---

## 1. System Architecture

Relay operates both as a static single-page studio (executed entirely in the browser with zero cloud dependencies) and as a standalone Node.js daemon providing headless REST endpoints.

```
+---------------------------------------------------------------------------------+
|                                   RELAY STUDIO                                  |
+---------------------------------------------------------------------------------+
|                                                                                 |
|   +-----------------------+     +-----------------------+     +---------------+ |
|   |  Sidebar Shapes Lib   |     |   Interactive Canvas  |     |   Inspector   | |
|   |  - Standard Entities  | --> |   - Draggable Nodes   | <-- |   - DDL SQL   | |
|   |  - Weak Entities (⚏)  |     |   - Double Border ⚏   |     |   - Mermaid   | |
|   |  - Junction Tables    |     |   - Crow's Foot SVG   |     |   - DBML      | |
|   |  - Connectors (1:N)   |     |   - Pan / Zoom 60 FPS |     |   - Analysis  | |
|   +-----------------------+     +-----------------------+     +---------------+ |
|                                             |                                   |
|                                             v                                   |
|   +-------------------------------------------------------------------------+   |
|   |                       Compiler & Analysis Pipeline                      |   |
|   |  - PostgreSQL DDL (UUID pgcrypto, constraints, indexes)                 |   |
|   |  - MySQL 8.0 DDL (Auto-Increment, engine dialects)                      |   |
|   |  - SQLite 3 DDL (Inline foreign keys, strict PRAGMAs)                   |   |
|   |  - Mermaid Crow's Foot ER Notation                                      |   |
|   |  - Database Markup Language (DBML v2)                                   |   |
|   |  - Microsoft Word DOCX OpenXML (.docx) Technical Report Generator       |   |
|   +-------------------------------------------------------------------------+   |
|                                             |                                   |
|                                             v                                   |
|   +-------------------------------------------------------------------------+   |
|   |                           Relational Telemetry                          |   |
|   |  - Normal Form Evaluator (1NF, 2NF, 3NF / BCNF)                         |   |
|   |  - McCabe Cyclomatic Complexity: M = E - V + 2P                         |   |
|   |  - Weak Entity & Cardinality Distribution Statistics                    |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------+
```

---

## 2. Weak Entities and Identifying Relationships

In relational modeling and Chen / Crow's Foot conventions:
- **Weak Entity**: An entity whose existence depends on another owner entity and cannot be uniquely identified by its own attributes alone. In Relay, weak entities are visually demarcated by a **double border** (`border: 3px double var(--accent)`) and marked with a `[WEAK]` badge.
- **Identifying Relationship**: The relationship connecting a weak entity to its owner entity. Relay highlights identifying relationships using a distinct dashed connection line and enforces cascading constraints (`ON DELETE CASCADE`) by default.

---

## 3. Schema Objects Explorer Popup

The studio includes a high-density **Schema Objects Explorer** popup modal accessed from the topbar:
- Displays all tables, columns, primary keys, and incoming foreign keys in a structured table.
- Real-time search filter across table names, column names, and data types.
- Quick navigation buttons to focus on any entity on the visual canvas.

---

## 4. Microsoft Word (.docx) Technical Report Generator

Relay contains an embedded, pure client-side ECMA-376 OpenXML compiler that builds a valid `.docx` document containing:
- **`[Content_Types].xml`**: MIME type registration for WordProcessingML parts.
- **`_rels/.rels`**: Root package relationships.
- **`word/document.xml`**: Technical report body including:
  1. Title and schema overview.
  2. Entity dictionaries with formatted tables detailing attribute names, types, primary keys, nullability, and default values.
  3. Relationship catalog with source, target, cardinality, and identifying status.
  4. Telemetry scorecard detailing normalization levels and McCabe cyclomatic complexity.

The generated `.docx` file is compatible with Microsoft Word, LibreOffice Writer, and Google Docs.

---

## 5. SQL Dialect Mapping

| Canonical Type | PostgreSQL | MySQL 8.0 | SQLite 3 |
| :--- | :--- | :--- | :--- |
| `uuid` | `UUID` | `VARCHAR(36)` | `TEXT` |
| `serial` | `SERIAL` | `INT AUTO_INCREMENT` | `INTEGER` |
| `bigserial` | `BIGSERIAL` | `BIGINT UNSIGNED AUTO_INCREMENT` | `INTEGER` |
| `varchar(n)` | `VARCHAR(n)` | `VARCHAR(n)` | `TEXT` |
| `text` | `TEXT` | `TEXT` | `TEXT` |
| `integer` | `INTEGER` | `INT` | `INTEGER` |
| `bigint` | `BIGINT` | `BIGINT` | `INTEGER` |
| `boolean` | `BOOLEAN` | `TINYINT(1)` | `INTEGER` |
| `timestamp` | `TIMESTAMP` | `DATETIME` | `TEXT` |
| `jsonb` | `JSONB` | `JSON` | `TEXT` |

---

## 6. Relational Algebra & Graph Complexity

### Normalization Evaluation

The telemetry engine verifies schema structural conformance:
- **1NF**: Atomic scalar values, uniqueness of column names, and absence of repeating attribute groups.
- **2NF**: Satisfies 1NF, and every non-key attribute is fully functionally dependent on the entire primary key.
- **3NF / BCNF**: Satisfies 2NF, and no non-key attribute is transitively dependent on the primary key.

### Cyclomatic Complexity

Cyclomatic complexity of the schema graph measures coupling between tables:

$$M = E - V + 2P$$

Where:
- $E$ = Number of foreign key relationship edges
- $V$ = Number of table entities (vertices)
- $P$ = Number of connected components (default $P = 1$)

---

## 7. Headless REST API

When running the Node.js server (`./start.sh` or `node dist/index.js`), the following REST endpoints are available:

- `GET /api/health`: Service health and uptime.
- `GET /api/templates`: List built-in starter schemas (`ecommerce`, `saas_auth`, `blog_cms`).
- `POST /api/compile`: Compiles a schema payload into target DDL, Mermaid ER, DBML, and telemetry.
- `POST /api/metrics`: Calculates cyclomatic complexity and normalization metrics.

---

## 8. Development & Execution

```bash
# Navigate to project directory
cd /home/lex/Desktop/relay

# Compile TypeScript
npm run build

# Launch standalone server
./start.sh
```
