# LangGraph Annotation Best Practices

## Core Principles

LangGraph annotations are based on Zod schemas and follow specific patterns to ensure type safety, consistency, and maintainability throughout the workflow. This guide defines the standards for creating and managing annotations in a LangGraph workflow.

## Annotation Structure

### Basic Structure

- All annotations must use Zod schemas from `zod/v4`.
- Annotations should be named according to the pattern `{nodeName}{Input|Output}Annotation`.
- Each node must have both input and output annotations defined.
- Use `z.object()` to define the schema structure.
- Use the `.shape` property when combining schemas.

### Schema Types

- Use `z.custom<T>()` for complex TypeScript types that do not require validation.
- Use `z.string()` for text values.
- Use `z.array(z.string())` for arrays of strings.
- Use `z.record(z.string(), z.unknown())` for dictionaries/objects with string keys.
- Use `z.boolean()` for boolean values.
- Use `z.number()` for numeric values.

## Naming Conventions

- Use camelCase for annotation variable names.
- Name annotations with the following pattern:
  - `{nodeName}InputAnnotation` for input annotations.
  - `{nodeName}OutputAnnotation` for output annotations.
- Use descriptive names that clearly indicate the purpose of the node.

## Type Safety

- Always import TypeScript types from the appropriate modules.
- Define a Zod schema variable for each custom type: `const TypeNameSchema = z.custom<TypeName>()`.
- Export all annotation schemas for reuse across nodes.
- Maintain strict typing in all annotations.

## Graph Annotation Patterns

Each LangGraph must have three main annotation components:

1.  **Input Annotation (input)**: The input state that must be passed when the graph is executed.
    -   **Root Graph**: Defined by analyzing the state used during the actual graph execution.
    -   **Sub-graph**: Uses values defined in the parent graph's annotation file and defines additional properties if necessary.
    ```typescript
    input: z.object({ ... })
    ```

2.  **Output Annotation (output)**: The output state that is returned after the graph finishes.
    -   **Root Graph**: Defined to include the final state of the graph and the output of any streamNodes.
    -   **Sub-graph**: Includes values defined in the parent graph's annotation file and the output of the sub-graph's streamNode.
    ```typescript
    output: z.object({ ... })
    ```

3.  **Overall Annotation (overall)**: Defines all states used in the workflow.
    -   A complete set of states including all inputs, intermediate states, and outputs.
    ```typescript
    overall: z.object({ ... })
    ```

## Composition Patterns

A general pattern for composing graph annotations:

```typescript
// Example of a Root Graph Annotation
export const webV2Annotation = {
  // The input state that must be passed when calling the graph
  input: z.object({
    // Required input properties
    ...preprocessInputAnnotation.shape,
    
    // Optional input properties (with partial applied)
    ...otherNodeInputAnnotation.partial().shape,
  }),
  
  // The output state returned after the graph finishes
  output: z.object({
    // Final node output
    ...finalNodeOutputAnnotation.shape,
    
    // streamNode output
    ...streamNodeOutputAnnotation.shape,
  }),
  
  // All states in the workflow
  overall: z.object({
    // Includes inputs and outputs of all nodes
    ...nodeAInputAnnotation.shape,
    ...nodeAOutputAnnotation.shape,
    ...nodeBInputAnnotation.shape,
    ...nodeBOutputAnnotation.shape,
  }),
};

// Example of a Sub-graph Annotation
export const subGraphAnnotation = {
  // Define additional properties on top of the input from the parent graph
  input: z.object({
    ...parentNodeInputAnnotation.shape,
    additionalProperty: z.string(),
  }),
  
  // Sub-graph output
  output: z.object({
    ...subNodeOutputAnnotation.shape,
  }),
  
  // All states of the sub-graph
  overall: z.object({
    ...allInputAnnotations.shape,
    ...allOutputAnnotations.shape,
  }),
};
```

Core rules for sub-graph annotations:

1.  **Input (input)**:
    -   Based on the input defined in the parent graph.
    -   Explicitly define any additional properties required for the sub-graph.

2.  **Output (output)**:
    -   Defines the final result of the sub-graph.
    -   If there is a streamNode within the sub-graph, its output must also be included.

3.  **Implementation**:
    ```typescript
    const createSubGraph = async () => {
      const graph = new StateGraph({
        input: subGraphAnnotation.input,    // Sub-graph input
        output: subGraphAnnotation.output,  // Sub-graph output
        state: subGraphAnnotation.overall,  // Sub-graph overall state
      })
      // Add and connect nodes
      return graph;
    };
    ```

## Key Summary

1.  **Consistent Patterns**:
    -   `input`: Defines the required input state for graph execution.
    -   `output`: Defines the output state returned after the graph finishes.
    -   `overall`: Includes all states in the workflow.

2.  **Hierarchical Structure**:
    -   **Root Graph**: The top-level graph that is executed directly.
    -   **Sub-graph**: A lower-level graph that acts as a node within a parent graph.

3.  **Stream Node**:
    -   Its output must be included in the graph's final output.
    -   Delivers data to the client in real-time.

4.  **Sub-graph Rules**:
    -   Based on the parent graph's input, but can define additional properties if needed.
    -   The output of the sub-graph must be clearly defined to be passed to the parent graph.