/**
 * GOAP & Utility Engine - COS30002
 * Advanced: Hierarchical & Composite Design Patterns.
 */

export class GOAPPlanner {
  constructor() {
    this.actions = [
      // Sparse/High-Level Actions
      { id: 'siege', name: 'Siege Target', cost: 10, pre: { hasTurret: true, nearEnemy: true }, post: { enemyDead: true }, composite: true },
      { id: 'skirmish', name: 'Skirmish', cost: 5, pre: { hasAmmo: true, nearEnemy: true }, post: { enemyDead: true } },
      
      // Middle Layers
      { id: 'build_turret', name: 'Build Auto-Turret', cost: 5, pre: { hasParts: true, nearEnemy: true }, post: { hasTurret: true } },
      { id: 'scavenge', name: 'Scavenge for Parts', cost: 3, pre: { nearDepot: true }, post: { hasParts: true } },
      { id: 'reload_task', name: 'Full Tactical Reload', cost: 2, pre: { hasAmmoReserve: true }, post: { hasAmmo: true }, composite: true },
      
      // Leaf/Low-Level Atomic Nodes (Denser)
      { id: 'move_enemy', name: 'Patrol to Enemy', cost: 2, pre: { nearEnemy: false }, post: { nearEnemy: true } },
      { id: 'move_depot', name: 'Move to Depot', cost: 2, pre: { nearDepot: false }, post: { nearDepot: true } },
      { id: 'move_health', name: 'Seek Medkit', cost: 2, pre: { nearHealth: false }, post: { nearHealth: true } },
      
      // Resource Leaves
      { id: 'find_medkit', name: 'Consume Kit', cost: 1, pre: { nearHealth: true }, post: { fullHealth: true } },
      { id: 'take_reserve', name: 'Loot Reserves', cost: 1, pre: { nearDepot: true }, post: { hasAmmoReserve: true } }
    ];
  }

  plan(goal, currentState) {
    if (!goal) return { path: [], allNodes: this.actions };
    
    const open = [{ state: goal, path: [], cost: 0, parent: null }];
    const closed = new Set();
    
    let iterations = 0;
    while (open.length > 0 && iterations < 100) {
      iterations++;
      open.sort((a, b) => a.cost - b.cost);
      const current = open.shift();
      
      if (this.isSatisfied(current.state, currentState)) {
        return { 
          path: current.path.reverse(), 
          allNodes: this.actions 
        }; 
      }

      const hash = JSON.stringify(Object.keys(current.state).sort().reduce((obj, key) => {
        obj[key] = current.state[key];
        return obj;
      }, {}));
      
      if (closed.has(hash)) continue;
      closed.add(hash);

      for (const action of this.actions) {
        if (this.canSatisfy(action, current.state)) {
            const nextState = { ...current.state };
            for (const key in action.post) {
                if (nextState[key] === action.post[key]) delete nextState[key];
            }
            for (const key in action.pre) {
                nextState[key] = action.pre[key];
            }
            open.push({
                state: nextState,
                path: [...current.path, action],
                cost: current.cost + action.cost,
                parent: current
            });
        }
      }
    }
    return { path: [], allNodes: this.actions }; 
  }

  isSatisfied(requirements, state) {
    for (const key in requirements) {
        if (state[key] !== requirements[key]) return false;
    }
    return true;
  }

  canSatisfy(action, requirements) {
    for (const key in requirements) {
        if (action.post[key] === requirements[key]) return true;
    }
    return false;
  }
}

export class UtilityEngine {
  calculate(params) {
    const { health, ammo, distEnemy, distHealth, distAmmo } = params;
    const h = health / 100; const a = ammo / 30;
    const de = distEnemy / 100; const dh = distHealth / 100;
    const da = distAmmo / 100;

    const u_attack = a > 0 ? (0.4 * a + 0.6 * (1 - de)) : 0;
    const u_heal = Math.pow(1 - h, 2) * (1 - dh);
    const u_flee = Math.max(0, (1 - h) * Math.pow(1 - de, 3));
    const u_ammo = a < 0.3 ? (1 - a) * (1 - da) : 0;

    return [
      { id: 'attack', label: 'Composite Attack', score: Math.min(1, Math.max(0, u_attack)), breakdown: `(Ammo ${a.toFixed(2)} * 0.4) + (DistEnemyInv ${(1-de).toFixed(2)} * 0.6)` },
      { id: 'heal', label: 'Composite Healing', score: Math.min(1, Math.max(0, u_heal)), breakdown: `(HealthInv ${(1-h).toFixed(2)}^2) * (DistHealthInv ${(1-dh).toFixed(2)})` },
      { id: 'flee', label: 'Reactive Flee', score: Math.min(1, Math.max(0, u_flee)), breakdown: `(HealthInv ${(1-h).toFixed(2)}) * (DistEnemyInv ${(1-de).toFixed(2)}^3)` },
      { id: 'ammo', label: 'Resource Search', score: Math.min(1, Math.max(0, u_ammo)), breakdown: `(LowAmmoInv ${(1-a).toFixed(2)}) * (DistAmmoInv ${(1-da).toFixed(2)})` }
    ].sort((a,b) => b.score - a.score);
  }
}
