# Chapter 1 - Introduction

## Purpose

This document defines the functional specifications for a visual programming language application. The application enables users to create programming logic through visual elements called "bricks" that can be connected together to form executable functions. The system provides project management capabilities, user authentication, database instance management, and a visual function editor where users assemble logic by dragging and linking visual components.

The purpose of this document is to provide a complete and definitive description of the system's functional requirements, user interface specifications, and operational behavior. This document serves as the foundation for system design, development, and testing activities.

## Audience

This document is intended for:

- **Developers**: Software engineers who will implement the application according to these specifications
- **Project Managers**: Stakeholders who need to understand the system's scope and functionality
- **Quality Assurance Engineers**: Testers who will validate the system against these requirements
- **Technical Writers**: Documentation specialists who will create user guides and technical documentation

The document assumes readers have basic knowledge of web application development, database concepts, and user interface design principles.

## Definitions & Abbreviations

### Definitions

**Brick**: A visual programming element that represents a specific operation or function. Bricks have inputs and outputs that can be connected to other bricks to form executable logic. Examples include "Project", "Function", "List instances by DB name", "Get first instance", and "Log instance props".

**Function**: A named collection of connected bricks that form a complete executable logic flow. Functions belong to projects and can be created, renamed, deleted, and edited through the visual function editor.

**Project**: A container that groups related functions together. Projects belong to users and can be shared with other users through permissions. Each project can contain multiple functions and has associated database instances.

**Database Instance**: A concrete data record that instantiates a database type. Database instances store actual property values. For example, the "default database" type has a string property, and each instance of this type contains a specific string value.

**Database Type**: A data structure definition that specifies the properties available for database instances. The "default database" is a database type with a string property.

**Project Permission**: An access control mechanism that grants specific users the right to view and work with a project. Only registered users can be granted project permissions.

**Authenticated User**: A user who has successfully registered and logged into the system. Only authenticated users can create projects, access the home screen, and use project editors.

**Function Editor**: A visual interface where users assemble functions by dragging bricks onto a grid-based canvas and connecting them via input/output links. Changes in the function editor are automatically persisted.

**Project Editor**: An interface with three tabs (Project, Permissions, Database) that allows users to manage functions, permissions, and database instances within a project.

**Grid Cell**: A position on the function editor canvas where bricks are placed. The canvas uses a grid layout system to organize brick placement.

**Input Parameter**: A connection point on a brick that receives data from another brick's output or accepts user-configured values.

**Output Parameter**: A connection point on a brick that provides data to other bricks' inputs.

**Link**: A visual connection line between a brick's output and another brick's input, establishing data flow between bricks.

**RUN Button**: A control in the function editor that executes the assembled brick logic and displays results in the console.

### Abbreviations

- **UI**: User Interface
- **DB**: Database
- **API**: Application Programming Interface
- **HTTP**: Hypertext Transfer Protocol
- **JSON**: JavaScript Object Notation

## General Presentation of the Document

This functional specification document is organized into four chapters:

**Chapter 1 - Introduction**: Provides the document's purpose, intended audience, key definitions, and document structure overview.

**Chapter 2 - General Description**: Describes the system's environment, conceptual model, user characteristics, development constraints, and working assumptions.

**Chapter 3 - Functional Requirements**: Details all use cases organized by actor, including inputs, processing actions, and outputs for each use case.

**Chapter 4 - Screens**: Specifies the user interface layout, navigation structure, menu system, and detailed descriptions of all application screens.

Each chapter builds upon the previous one, moving from high-level concepts to specific functional requirements and interface specifications. The document uses definitive language throughout, specifying exact system behavior without ambiguity or optional features.
