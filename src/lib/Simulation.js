/**
 * Behaviour Tree (BT) & Decision Engine - COS30002
 * Implements Selectors, Sequences, and Atomic Leaves.
 */

export const NodeStatus = {
  READY: 'READY',
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  EVALUATING: 'EVALUATING'
};

export class BTNode {
  constructor(id, name, type, children = []) {
    this.id = id;
    this.name = name;
    this.type = type; // 'selector', 'sequence', 'action', 'condition'
    this.children = children;
    this.status = NodeStatus.READY;
    this.isExpanded = true;
  }
}

export class BehaviourTree {
  constructor() {
    this.root = this.buildInitialTree();
  }

  buildInitialTree() {
    // Composite Sub-Tree: Build Auto-Turret
    const buildTurret = new BTNode('build_turret', 'BUILD AUTO-TURRET', 'sequence', [
      new BTNode('scavenge', 'SCAVENGE FOR PARTS', 'action'),
      new BTNode('move_depot', 'MOVE TO DEPOT', 'action'),
      new BTNode('construct', 'CONSTRUCT TURRET', 'action')
    ]);
    buildTurret.isComposite = true;

    // Sequence: Siege Target
    const siege = new BTNode('siege', 'SIEGE TARGET', 'sequence', [
      buildTurret
    ]);

    // Selector: Skirmish
    const skirmish = new BTNode('skirmish', 'SKIRMISH', 'selector', [
      new BTNode('reload', 'FULL TACTICAL RELOAD', 'action'),
      new BTNode('patrol', 'PATROL TO ENEMY', 'action')
    ]);

    // Sequence: Emergency Survival
    const emergency = new BTNode('emergency', 'EMERGENCY SURVIVAL', 'sequence', [
      new BTNode('cond_health', 'Health < 30%', 'condition'),
      new BTNode('seek_medkit', 'SEEK MEDKIT', 'action'),
      new BTNode('consume_kit', 'CONSUME KIT', 'action')
    ]);

    // Root: Combat AI
    return new BTNode('root', 'COMBAT AI', 'selector', [
      emergency,
      skirmish,
      siege
    ]);
  }

  tick(node, params) {
    node.status = NodeStatus.EVALUATING;
    
    if (node.type === 'condition') {
      const result = this.evaluateCondition(node, params);
      node.status = result ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
      return node.status;
    }

    if (node.type === 'action') {
      const result = this.evaluateAction(node, params);
      node.status = result;
      return node.status;
    }

    if (node.type === 'selector') {
      for (const child of node.children) {
        const res = this.tick(child, params);
        if (res === NodeStatus.SUCCESS || res === NodeStatus.RUNNING) {
          node.status = res;
          // Mark remaining children as ready for next pass
          this.resetRemaining(node, node.children.indexOf(child) + 1);
          return res;
        }
      }
      node.status = NodeStatus.FAILURE;
      return NodeStatus.FAILURE;
    }

    if (node.type === 'sequence') {
      for (const child of node.children) {
        const res = this.tick(child, params);
        if (res === NodeStatus.FAILURE || res === NodeStatus.RUNNING) {
          node.status = res;
          this.resetRemaining(node, node.children.indexOf(child) + 1);
          return res;
        }
      }
      node.status = NodeStatus.SUCCESS;
      return NodeStatus.SUCCESS;
    }

    return NodeStatus.FAILURE;
  }

  evaluateCondition(node, params) {
    if (node.id === 'cond_health') return params.health < 30;
    return true;
  }

  evaluateAction(node, params) {
    // Basic logic for simulation:
    if (node.id === 'reload' && params.ammo > 10) return NodeStatus.FAILURE; // Don't reload if have ammo
    if (node.id === 'patrol' && params.distEnemy < 10) return NodeStatus.SUCCESS;
    if (node.id === 'seek_medkit' && params.distHealth > 0) return NodeStatus.RUNNING;
    return NodeStatus.SUCCESS;
  }

  resetRemaining(node, startIndex) {
    for (let i = startIndex; i < node.children.length; i++) {
      this.resetNodes(node.children[i]);
    }
  }

  resetNodes(node) {
    node.status = NodeStatus.READY;
    if (node.children) node.children.forEach(c => this.resetNodes(c));
  }
}

export class UtilityEngine {
  calculate(params) {
    const { health, ammo, distEnemy, distHealth, distAmmo } = params;
    const h = health / 100; const a = ammo / 30;
    const de = distEnemy / 100; const dh = distHealth / 100;
    const da = distAmmo / 100;

    return [
      { id: 'attack', label: 'Composite Attack', score: Math.min(1, Math.max(0, (0.4 * a + 0.6 * (1 - de)))), breakdown: 'Ammo/Dist Blend' },
      { id: 'heal', label: 'Composite Healing', score: Math.min(1, Math.max(0, Math.pow(1-h, 2) * (1-dh))), breakdown: 'Exponential Health Drop' }
    ].sort((a,b) => b.score - a.score);
  }
}
