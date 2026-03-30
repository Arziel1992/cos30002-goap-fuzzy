/**
 * GOAP & Utility/Fuzzy Logic Engine - COS30002
 * Implements regressive A* planning and fuzzy utility curves.
 */

export class GOAPPlanner {
  constructor() {
    this.actions = [
      { id: 'attack', name: 'Attack Enemy', cost: 1, pre: { hasAmmo: true, nearEnemy: true }, post: { enemyDead: true } },
      { id: 'move_enemy', name: 'Move to Enemy', cost: 2, pre: { nearEnemy: false }, post: { nearEnemy: true } },
      { id: 'collect_ammo', name: 'Collect Ammo', cost: 1, pre: { nearAmmo: true }, post: { hasAmmo: true } },
      { id: 'move_ammo', name: 'Move to Ammo Depot', cost: 2, pre: { nearAmmo: false }, post: { nearAmmo: true } },
      { id: 'heal', name: 'Heal Agent', cost: 1, pre: { nearHealth: true }, post: { fullHealth: true } },
      { id: 'move_health', name: 'Move to Health Pack', cost: 2, pre: { nearHealth: false }, post: { nearHealth: true } }
    ];
  }

  plan(goal, currentState) {
    const open = [{ state: goal, path: [], cost: 0 }];
    const closed = new Set();
    
    while (open.length > 0) {
      open.sort((a, b) => a.cost - b.cost);
      const current = open.shift();
      
      // Check if current requirements are met by currentState
      if (this.isSatisfied(current.state, currentState)) {
        return current.path.reverse(); // Plan found!
      }

      const hash = JSON.stringify(current.state);
      if (closed.has(hash)) continue;
      closed.add(hash);

      for (const action of this.actions) {
        // Can this action satisfy at least one requirement?
        if (this.canSatisfy(action, current.state)) {
            const nextState = { ...current.state };
            // Remove requirements satisfied by action.post
            for (const key in action.post) {
                if (nextState[key] === action.post[key]) {
                    delete nextState[key];
                }
            }
            // Add new requirements from action.pre
            for (const key in action.pre) {
                nextState[key] = action.pre[key];
            }
            
            open.push({
                state: nextState,
                path: [...current.path, action],
                cost: current.cost + action.cost
            });
        }
      }
    }
    return null; // No plan
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
    
    const h = health / 100;
    const a = ammo / 30;
    const de = distEnemy / 100;
    const dh = distHealth / 100;

    // Fuzzy Curves
    const u_attack = a > 0 ? (0.5 * a + 0.5 * (1 - de)) : 0;
    const u_heal = Math.pow(1 - h, 2) * (1 - dh);
    const u_flee = (1 - h) * Math.pow(1 - de, 3);

    return [
      { id: 'attack', label: 'Attack Enemy', score: Math.min(1, Math.max(0, u_attack)), breakdown: `(Ammo ${a.toFixed(2)} * 0.5) + (DistInvert ${ (1-de).toFixed(2) } * 0.5)` },
      { id: 'heal', label: 'Seek Health', score: Math.min(1, Math.max(0, u_heal)), breakdown: `(HealthInvert ${ (1-h).toFixed(2) }^2) * (DistHealthInvert ${ (1-dh).toFixed(2) })` },
      { id: 'flee', label: 'Flee Environment', score: Math.min(1, Math.max(0, u_flee)), breakdown: `(HealthInvert ${ (1-h).toFixed(2) }) * (DistEnemyInvert ${ (1-de).toFixed(2) }^3)` }
    ].sort((a,b) => b.score - a.score);
  }
}
