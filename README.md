<div align="center">
  <img src="logo.svg" alt="Relay Logo" width="160" />
  <p align="center">
    <strong>Relational SQL schema designer &amp; Entity-Relationship diagram studio</strong>
  </p>
  <p align="center">
    <a href="https://lexp-hub.github.io/Relay/"><img src="https://img.shields.io/badge/Live_Demo-GitHub_Pages-10b981?style=flat-square&logo=githubpages&logoColor=white" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Runtime-Node.js_Standalone-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js Standalone" />
    <img src="https://img.shields.io/badge/Dialects-PostgreSQL_|_MySQL_|_SQLite-10b981?style=flat-square&logo=postgresql" alt="Dialects" />
    <img src="https://img.shields.io/badge/Export-Mermaid_|_DBML_|_DDL_|_DOCX-10b981?style=flat-square" alt="Export Formats" />
    <img src="https://img.shields.io/badge/License-MIT-emerald?style=flat-square" alt="License" />
  </p>
  <p align="center">
    <strong><a href="https://lexp-hub.github.io/Relay/">Open Web Studio &rarr;</a></strong>
  </p>
</div>

---

**Relay** is a minimalist, browser-first relational database modeling and Entity-Relationship (ER) diagramming studio. It compiles visual schema models into PostgreSQL, MySQL, and SQLite DDL, Mermaid diagrams, DBML, and technical documentation.

- **Dual Notation**: Toggle between conceptual Chen ER modeling (entities, relationship diamonds, attribute ovals, (min, max) cardinalities) and physical Crow's foot schemas with Manhattan orthogonal connectors.
- **Advanced Hierarchies**: Model ISA generalization/specialization with coverage and exclusivity flags, plus automatic primary key inheritance.
- **N-Ary & Complex Attributes**: Multi-entity relationships, composite attribute tree-branching, multivalued and derived attributes.
- **Reverse Engineering**: Import existing SQL DDL scripts or Mermaid ER code into editable visual entities.
- **Code Generation**: Real-time compilation to PostgreSQL, MySQL, SQLite, Mermaid, DBML, and Word (.docx) reports.

For detailed architecture, relational algebra specifications, and API documentation, see [DOCUMENTATION.md](DOCUMENTATION.md).

---

### Quick Start

```bash
# Clone the repository
git clone https://github.com/lexp-hub/Relay.git
cd Relay

# Install dependencies and build
npm install
npm run build

# Start the standalone local daemon
npm start
```

Live studio: **[https://lexp-hub.github.io/Relay/](https://lexp-hub.github.io/Relay/)**

---

## License

[MIT](LICENSE)
