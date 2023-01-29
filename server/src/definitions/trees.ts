import { z } from 'zod';

export const NodeSchema = z.object({
    id: z.string(),
});

export const EdgeTypeSchema = z.enum(['P2C', 'R']);

export const EdgeSchema = z.object({
    type: EdgeTypeSchema,
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
});

export const TreeSchema = z.object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema),
});

export const OperationSchema = z.object({
    type: z.enum(['ADD', 'DEL']),
    entity: z.enum(['NODE', 'EDGE']),
});

export const NodeOperationSchema = OperationSchema.extend({
    entity: z.literal('NODE'),
    nodeId: z.string(),
});

export const EdgeOperationSchema = OperationSchema.extend({
    entity: z.literal('EDGE'),
    edgeType: EdgeTypeSchema,
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
});

export const PatchTreeBodySchema = z.object({
    operations: z.array(z.union([NodeOperationSchema, EdgeOperationSchema])),
});

export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type Tree = z.infer<typeof TreeSchema>;
export type EdgeType = z.infer<typeof EdgeTypeSchema>;
export type Operation = z.infer<typeof OperationSchema>;
export type NodeOperation = z.infer<typeof NodeOperationSchema>;
export type EdgeOperation = z.infer<typeof EdgeOperationSchema>;
export type PatchTreeBody = z.infer<typeof PatchTreeBodySchema>;
