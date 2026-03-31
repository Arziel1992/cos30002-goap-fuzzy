/**
 * Behaviour Tree (BT) & Decision Engine - COS30002
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
    this.isScoped = false; 
  }
}

export class BehaviourTree {
  constructor() {
    this.root = this.buildInitialTree();
  }

  buildInitialTree() {
    // Composite Scoped Sub-Tree: Build Auto-Turret
    const scavenge = new BTNode('scavenge', 'SCAVENGE FOR PARTS', 'action');
    const moveDepot = new BTNode('move_depot', 'MOVE TO DEPOT', 'action');
    const construct = new BTNode('construct', 'CONSTRUCT TURRET', 'action');

    const buildTurret = new BTNode('build_turret', 'BUILD AUTO-TURRET', 'sequence', [
      scavenge, moveDepot, construct
    ]);
    buildTurret.isScoped = true;

    // Sequence: Siege Target
    const siege = new BTNode('siege', 'SIEGE TARGET', 'sequence', [
      new BTNode('cond_siege', 'Goal == Siege', 'condition'),
      buildTurret
    ]);

    // Selective Branches
    const skirmish = new BTNode('skirmish', 'SKIRMISH', 'selector', [
      new BTNode('reload', 'RELOAD WEAPON', 'action'),
      new BTNode('patrol', 'PATROL TO ENEMY', 'action')
    ]);

    const emergency = new BTNode('emergency', 'SURVIVAL PROTOCOL', 'sequence', [
      new BTNode('cond_health', 'Health < 30%', 'condition'),
      new BTNode('seek_medkit', 'SEEK MEDKIT', 'action'),
      new BTNode('consume_kit', 'CONSUME KIT', 'action')
    ]);

    // Root: Goal-Oriented Selector
    return new BTNode('root', 'GOAL SELECTOR', 'selector', [
      emergency,
      siege,
      skirmish
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
      // Prioritization logic
      const orderedChildren = [...node.children];
      if (params.goal === 'siege' && node.id === 'root') {
          const siegeIdx = orderedChildren.findIndex(c => c.id === 'siege');
          if (siegeIdx > -1) {
              const [s] = orderedChildren.splice(siegeIdx, 1);
              orderedChildren.unshift(s);
          }
      }

      for (const child of orderedChildren) {
        const res = this.tick(child, params);
        if (res === NodeStatus.SUCCESS || res === NodeStatus.RUNNING) {
          node.status = res;
          this.resetRemaining(node, orderedChildren, orderedChildren.indexOf(child) + 1);
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
          this.resetRemaining(node, node.children, node.children.indexOf(child) + 1);
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
    if (node.id === 'cond_siege') return params.goal === 'siege';
    return true;
  }

  evaluateAction(node, params) {
    // Skirmish logic
    if (node.id === 'reload') {
        return params.ammo < 10 ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
    }
    if (node.id === 'patrol') {
        return params.distEnemy < 50 ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
    }
    
    if (node.id === 'scavenge') return params.distAmmo < 20 ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
    if (node.id === 'move_depot') return NodeStatus.RUNNING;
    return NodeStatus.SUCCESS;
  }

  resetRemaining(node, children, startIndex) {
    for (let i = startIndex; i < children.length; i++) {
      this.resetNodes(children[i]);
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
    
    const hNorm = health / 100;
    const healScore = Math.pow(1 - hNorm, 2) * (1 - (distHealth / 100));

    const ammoNorm = ammo / 30;
    const distEnemyNorm = distEnemy / 100;
    const attackScore = ammoNorm * (1 - distEnemyNorm) * (health > 20 ? 1 : 0.2);

    const reloadScore = (1 - ammoNorm) * 0.8;
    const scavengeScore = (1 - ammoNorm) * (1 - (distAmmo / 100));

    return [
      { id: 'attack', label: 'Attack Action', score: Math.min(1, Math.max(0, attackScore)) },
      { id: 'heal', label: 'Heal Action', score: Math.min(1, Math.max(0, healScore)) },
      { id: 'reload', label: 'Reload Action', score: Math.min(1, Math.max(0, reloadScore)) },
      { id: 'scavenge', label: 'Scavenge Action', score: Math.min(1, Math.max(0, scavengeScore)) }
    ].sort((a,b) => b.score - a.score);
  }
}
