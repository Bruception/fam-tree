import { Router } from 'express';
import * as TreeDefinitions from '../definitions/trees';
import { validateRequest, asyncHandler } from '../middlewares/api';

export const router = Router();

const tree: TreeDefinitions.Tree = {
  nodes: [],
  edges: [],
};

router.get('/', (req, res) => {
  res.json(tree);
});

const getEdgeIdFromOp = (edgeOp: TreeDefinitions.EdgeOperation) => `${edgeOp.sourceNodeId}-${edgeOp.edgeType}-${edgeOp.targetNodeId}`;
const getEdgeId = (edge: TreeDefinitions.Edge) => `${edge.sourceNodeId}-${edge.type}-${edge.targetNodeId}`;

router.patch(
  '/',
  validateRequest({
    body: TreeDefinitions.PatchTreeBodySchema,
  }),
  asyncHandler(async (req) => {
    const { operations }: TreeDefinitions.PatchTreeBody = req.body;

    const existingNodes = new Set(tree.nodes.map(node => node.id));
    const existingEdges = new Set(tree.edges.map(getEdgeId))

    function handleAddOperation(operation: TreeDefinitions.Operation) {
      if (operation.entity === 'NODE') {
        const { nodeId } = operation as TreeDefinitions.NodeOperation;
        if (existingNodes.has(nodeId)) {
          return;
        }

        tree.nodes.push({
          id: nodeId,
        });
      }

      // TODO: Validate that added edges maintain DAG constraint.
      if (operation.entity === 'EDGE') {
        const { edgeType, targetNodeId, sourceNodeId } = operation as TreeDefinitions.EdgeOperation;

        const edgeId = `${sourceNodeId}-${edgeType}-${targetNodeId}`;
        if (existingEdges.has(edgeId)) {
          return;
        }


        tree.edges.push({
          type: edgeType,
          targetNodeId,
          sourceNodeId,
        });
      }
    }
    
    function handleDeleteOperation(operation: TreeDefinitions.Operation) {
      if (operation.entity === 'NODE') {
        const { nodeId } = operation as TreeDefinitions.NodeOperation;
        if (!existingNodes.has(nodeId)) {
          return;
        }

        // Delete all referencing edges
        tree.edges = tree.edges.filter(edge => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId);

        // Delete the node
        tree.nodes = tree.nodes.filter(node => node.id !== nodeId);
      }

      if (operation.entity === 'EDGE') {
        const edgeId = getEdgeIdFromOp(operation as TreeDefinitions.EdgeOperation);
        if (!existingEdges.has(edgeId)) {
          return;
        }

        tree.edges = tree.edges.filter(edge => getEdgeId(edge) !== edgeId)
      }
    }

    operations.forEach((operation) => {
      switch (operation.type) {
        case 'ADD':
          return handleAddOperation(operation);
        case 'DEL':
          return handleDeleteOperation(operation);
      }
    });

    return tree;
  }),
);
