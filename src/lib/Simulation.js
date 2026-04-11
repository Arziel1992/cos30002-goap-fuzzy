/**
 * Behaviour Tree (BT) & Decision Engine - COS30002
 * Expanded Strategy Logic: Healing, Siege, Defense (Turret), Patrol
 */

export const NodeStatus = {
	READY: "READY",
	RUNNING: "RUNNING",
	SUCCESS: "SUCCESS",
	FAILURE: "FAILURE",
	EVALUATING: "EVALUATING",
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
		this.utility = 0; // For fuzzy evaluation
	}
}

export class BehaviourTree {
	constructor() {
		this.root = this.buildInitialTree();
	}

	buildInitialTree() {
		// 1. HEALING STRATEGY
		const healing = new BTNode("healing", "HEALING STRATEGY", "sequence", [
			new BTNode("cond_low_hp", "HP < 30%", "condition"),
			new BTNode("move_medkit", "MOVE TO MED STORAGE", "action"),
			new BTNode("apply_patch", "APPLY BIOPATCH", "action"),
		]);

		// 2. DEFENSE STRATEGY (Build Turrets - Scoped)
		const scavenge = new BTNode("scavenge", "SCAVENGE SCRAP", "action");
		const moveDepot = new BTNode("move_depot", "MOVE TO DEPOT", "action");
		const construct = new BTNode("construct", "CONSTRUCT TURRET", "action");

		const turretSubset = new BTNode(
			"turret_logic",
			"TURRET ASSEMBLY",
			"sequence",
			[scavenge, moveDepot, construct],
		);
		turretSubset.isScoped = true;

		const defense = new BTNode("defense", "DEFENSE STRATEGY", "sequence", [
			new BTNode("cond_defense", "Goal == Defense", "condition"),
			turretSubset,
		]);

		// 3. SIEGE STRATEGY (Attack Enemy Base)
		const infiltrate = new BTNode("infiltrate", "INFILTRATE BASE", "action");
		const plantCharge = new BTNode("plant", "PLANT EXPLOSIVES", "action");
		const detonate = new BTNode("detonate", "REMOTE DETONATE", "action");

		const siegeSubset = new BTNode(
			"siege_logic",
			"BASE DEMOLITION",
			"sequence",
			[infiltrate, plantCharge, detonate],
		);
		siegeSubset.isScoped = true;

		const siege = new BTNode("siege", "SIEGE STRATEGY", "sequence", [
			new BTNode("cond_siege", "Goal == Siege", "condition"),
			siegeSubset,
		]);

		// 4. PATROLLING STRATEGY (Default)
		const reloading = new BTNode("reloading", "RELOAD (LOW AMMO)", "action");
		const scouting = new BTNode("scouting", "SCOUT AREA", "action");
		const patrol = new BTNode("patrolling", "PATROLLING STRATEGY", "selector", [
			reloading,
			scouting,
		]);

		// ROOT NODE
		return new BTNode("root", "GOAL SELECTOR", "selector", [
			healing,
			defense,
			siege,
			patrol,
		]);
	}

	tick(node, params, mode = "binary") {
		node.status = NodeStatus.EVALUATING;

		if (node.type === "condition") {
			const result = this.evaluateCondition(node, params);
			node.status = result ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
			return node.status;
		}

		if (node.type === "action") {
			const result = this.evaluateAction(node, params);
			node.status = result;
			return node.status;
		}

		if (node.type === "selector") {
			const orderedChildren = [...node.children];

			if (mode === "fuzzy") {
				// Calculate utility for children and sort
				orderedChildren.forEach((child) => {
					child.utility = this.calculateChildUtility(child, params);
				});
				orderedChildren.sort((a, b) => b.utility - a.utility);
			}

			for (const child of orderedChildren) {
				const res = this.tick(child, params, mode);
				if (res === NodeStatus.SUCCESS || res === NodeStatus.RUNNING) {
					node.status = res;
					this.resetRemaining(
						node,
						orderedChildren,
						orderedChildren.indexOf(child) + 1,
					);
					return res;
				}
			}
			node.status = NodeStatus.FAILURE;
			return NodeStatus.FAILURE;
		}

		if (node.type === "sequence") {
			for (const child of node.children) {
				const res = this.tick(child, params, mode);
				if (res === NodeStatus.FAILURE || res === NodeStatus.RUNNING) {
					node.status = res;
					this.resetRemaining(
						node,
						node.children,
						node.children.indexOf(child) + 1,
					);
					return res;
				}
			}
			node.status = NodeStatus.SUCCESS;
			return NodeStatus.SUCCESS;
		}

		return NodeStatus.FAILURE;
	}

	calculateChildUtility(child, params) {
		const { health, ammo, distEnemy, goal } = params;
		if (child.id === "healing") return (1 - health / 100) * 1.5; // High priority if low health
		if (child.id === "defense") return goal === "defense" ? 1.0 : 0.2;
		if (child.id === "siege") return goal === "siege" ? 1.0 : 0.1;
		if (child.id === "patrolling") return 0.5; // Baseline
		return 0;
	}

	evaluateCondition(node, params) {
		if (node.id === "cond_low_hp") return params.health < 30;
		if (node.id === "cond_defense") return params.goal === "defense";
		if (node.id === "cond_siege") return params.goal === "siege";
		return true;
	}

	evaluateAction(node, params) {
		if (node.id === "reloading")
			return params.ammo < 5 ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
		if (node.id === "scouting")
			return params.distEnemy > 80 ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
		if (
			node.id === "move_depot" ||
			node.id === "move_medkit" ||
			node.id === "infiltrate"
		)
			return NodeStatus.RUNNING;
		return NodeStatus.SUCCESS;
	}

	resetRemaining(node, children, startIndex) {
		for (let i = startIndex; i < children.length; i++) {
			this.resetNodes(children[i]);
		}
	}

	resetNodes(node) {
		node.status = NodeStatus.READY;
		if (node.children) node.children.forEach((c) => this.resetNodes(c));
	}
}

export class UtilityEngine {
	calculateScores(params) {
		const { health, ammo, distEnemy, goal } = params;

		// HEALING
		const uHealing = (1 - health / 100) ** 2;
		// DEFENSE
		const uDefense = goal === "defense" ? 0.9 : 0.2;
		// SIEGE
		const uSiege = goal === "siege" ? 0.8 : 0.1;
		// PATROL
		const uPatrol = 0.5 + (distEnemy / 100) * 0.3;

		return [
			{ id: "healing", label: "Healing Strategy", score: uHealing },
			{ id: "defense", label: "Defense Strategy", score: uDefense },
			{ id: "siege", label: "Siege Strategy", score: uSiege },
			{ id: "patrolling", label: "Patrol Strategy", score: uPatrol },
		].sort((a, b) => b.score - a.score);
	}
}
