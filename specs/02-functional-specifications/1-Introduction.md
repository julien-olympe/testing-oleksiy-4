# 1. Introduction

## Purpose

This document defines the functional specifications for a visual programming application. The system enables users to create programming logic through visual elements called "bricks" that represent functions and operations. Users assemble these bricks to build executable functions that interact with databases and perform operations.

The application is a new system being developed from scratch. It provides a web-based interface where users can create projects, define functions using visual programming, manage database instances, and execute their logic.

## Audience

This document is intended for:
- Software developers implementing the system
- Quality assurance engineers creating test cases
- Project managers tracking development progress
- System architects designing the technical architecture
- Product owners validating feature completeness

Readers are expected to have basic understanding of web application development, user interface design, and software requirements documentation.

## Definitions and Abbreviations

**Brick**: A visual programming element that represents a function or operation. Bricks have inputs and outputs that can be connected to other bricks to form executable logic. Examples include "Project", "Function", "List instances by DB name", "Get first instance", and "Log instance props".

**Function**: A named executable unit of logic created within a project. Functions are built by connecting bricks together. Each function can be executed using the RUN button in the Function Editor.

**Project**: A container that groups related functions together. Projects belong to specific users and can have permissions assigned to allow other users to access them.

**Instance**: A data record stored in a database. Each instance contains values for the properties defined by the database schema. The default database contains instances with a string property.

**Database**: A data structure that defines properties and stores instances. The system includes a default database with a string property. Users can create instances of databases and set property values.

**User**: A registered account holder who can log in, create projects, and execute functions. Users are identified by email addresses.

**Permission**: Access rights granted to users for viewing and editing a specific project. Only registered users can be granted permissions.

**Grid**: A layout system in the Function Editor that positions bricks in discrete cells, ensuring organized placement of visual elements.

**Connection Line**: A visual link between brick outputs and inputs that defines data flow between bricks.

**Console**: The output mechanism where execution results and logged values are displayed when functions are executed.

## General Presentation of Document Structure

This functional specification document is organized into the following sections:

**Section 1 - Introduction**: Provides purpose, audience, definitions, and document structure overview.

**Section 2 - General Description**: Describes the system environment, conceptual model, user characteristics, development constraints, and working assumptions.

**Section 3 - Functional Requirements**: Details all use cases organized by functional area:
- 3-1: Authentication use cases (Registration, Login, Logout)
- 3-2: Project Management use cases (Create, Rename, Delete, View, Open)
- 3-3: Project Editor use cases (Function management, Permissions, Database management)
- 3-4: Function Editor use cases (Brick operations, Connections, Execution)

**Section 4 - Screens**: Describes all user interface screens, their layouts, components, and navigation flows.

Each use case follows a standard template including: Use Case Name, Description, Actors Involved, Inputs and Their Sources, Processing/Actions, and Outputs (including error messages).
