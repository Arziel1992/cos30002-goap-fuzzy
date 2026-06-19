/**
 * Cognitive Decision Architecture — COS30002 Module 5
 *
 * Two real AI techniques, layered to match the tool's hierarchy:
 *
 *   STRATEGY SELECTOR  →  Fuzzy logic. Crisp inputs (health, ammo, enemy
 *                         distance) are fuzzified through membership functions
 *                         and combined by rules into a DESIRABILITY for each
 *                         strategic goal. The highest-firing goal is selected.
 *
 *   TACTICAL LAYER     →  GOAP (Goal-Oriented Action Planning). For the chosen
 *                         goal-state, an A* planner searches the action space
 *                         (each action has preconditions, effects and a cost)
 *                         for the cheapest sequence that reaches the goal.
 *
 *   SMALL DECISIONS    →  The individual planned actions, executed in order.
 *
 * This file is pure logic — no DOM. App.svelte drives it and feeds the result
 * to the force-directed graph for visualisation.
 */

// ─────────────────────────────────────────────
// FUZZY LOGIC — membership functions
// ─────────────────────────────────────────────

/** Left shoulder: 1 at/below a, ramps down to 0 at b. */
function shoulderL(x, a, b) {
	if (x <= a) return 1;
	if (x >= b) return 0;
	return (b - x) / (b - a);
}

/** Right shoulder: 0 at/below a, ramps up to 1 at b. */
function shoulderR(x, a, b) {
	if (x <= a) return 0;
	if (x >= b) return 1;
	return (x - a) / (b - a);
}

/** Triangular set peaking at b, zero at/outside a and c. */
function triangle(x, a, b, c) {
	if (x <= a || x >= c) return 0;
	return x < b ? (x - b) / (b - a) + 1 : (c - x) / (c - b);
}

/**
 * Membership functions per linguistic variable. Inputs are crisp slider values.
 * health, enemyDist: 0–100. ammo: 0–30 (matches the UI range).
 */
export const FUZZY_SETS = {
	health: {
		critical: (x) => shoulderL(x, 25, 45),
		wounded: (x) => triangle(x, 30, 55, 80),
		healthy: (x) => shoulderR(x, 55, 80),
	},
	ammo: {
		low: (x) => shoulderL(x, 6, 14),
		medium: (x) => triangle(x, 10, 18, 26),
		high: (x) => shoulderR(x, 14, 24),
	},
	enemyDist: {
		near: (x) => shoulderL(x, 30, 55),
		medium: (x) => triangle(x, 35, 60, 85),
		far: (x) => shoulderR(x, 60, 90),
	},
};

const fand = Math.min; // fuzzy AND
const fOr = Math.max; // fuzzy OR / aggregation

/**
 * Fuzzify the inputs and fire the rule base to produce a desirability (0–1) for
 * each strategy. Mamdani-style: AND = min, rule aggregation per goal = max.
 * @param {{health:number, ammo:number, enemyDist:number}} inputs
 */
export function evaluateFuzzy(inputs) {
	const H = FUZZY_SETS.health;
	const A = FUZZY_SETS.ammo;
	const E = FUZZY_SETS.enemyDist;

	const m = {
		health: {
			critical: H.critical(inputs.health),
			wounded: H.wounded(inputs.health),
			healthy: H.healthy(inputs.health),
		},
		ammo: {
			low: A.low(inputs.ammo),
			medium: A.medium(inputs.ammo),
			high: A.high(inputs.ammo),
		},
		enemyDist: {
			near: E.near(inputs.enemyDist),
			medium: E.medium(inputs.enemyDist),
			far: E.far(inputs.enemyDist),
		},
	};

	// Rule base → goal desirabilities.
	const eliminate = fOr(
		fand(m.enemyDist.near, m.ammo.high),
		fand(m.enemyDist.medium, m.ammo.high, m.health.healthy),
	);
	const survive = fOr(
		m.health.critical, // critically hurt → survive, unconditionally
		fand(m.health.wounded, m.enemyDist.near),
		fand(m.ammo.low, m.enemyDist.near), // can't fight, disengage
	);
	const patrol = fOr(
		m.enemyDist.far,
		fand(m.health.healthy, m.enemyDist.medium, m.ammo.medium),
	);

	return { memberships: m, desirabilities: { eliminate, survive, patrol } };
}

// ─────────────────────────────────────────────
// GOAP — action set, goals, world state
// ─────────────────────────────────────────────

/**
 * Action library. Each action has boolean preconditions that must hold in the
 * world state, effects it applies, and a cost the planner minimises.
 */
export const ACTIONS = [
	{ id: "move", name: "Move To Enemy", cost: 3, pre: {}, eff: { nearEnemy: true } },
	{ id: "reload", name: "Reload Weapon", cost: 2, pre: { hasAmmo: true }, eff: { weaponLoaded: true } },
	{ id: "attack", name: "Attack Enemy", cost: 2, pre: { weaponLoaded: true, nearEnemy: true }, eff: { enemyDead: true } },
	{ id: "cover", name: "Take Cover", cost: 2, pre: {}, eff: { atCover: true } },
	{ id: "medkit", name: "Grab Medkit", cost: 3, pre: {}, eff: { hasMedkit: true } },
	{ id: "heal", name: "Apply Medkit", cost: 2, pre: { hasMedkit: true }, eff: { healed: true } },
	{ id: "patrol", name: "Patrol Route", cost: 1, pre: {}, eff: { patrolled: true } },
];

/** Strategic goals = a target world state the GOAP planner must reach. */
export const STRATEGIES = [
	{ id: "eliminate", label: "Eliminate Threat", goal: { enemyDead: true } },
	{ id: "survive", label: "Survive & Recover", goal: { atCover: true, healed: true } },
	{ id: "patrol", label: "Patrol Sector", goal: { patrolled: true } },
];

const GOAL_STATES = Object.fromEntries(STRATEGIES.map((s) => [s.id, s.goal]));

/**
 * BINARY strategy selection — the classic comparison baseline. Fixed priority
 * order with crisp threshold conditions; the first rule that fires wins. Unlike
 * the fuzzy layer there is no blending: a value is either over the threshold or
 * not, so the binary pick can disagree with the fuzzy pick near boundaries.
 * @param {{health:number, ammo:number, enemyDist:number}} inputs
 */
export function selectBinary(inputs) {
	if (inputs.health < 30) return "survive"; // critically hurt
	if (inputs.enemyDist < 35 && inputs.ammo > 8) return "eliminate"; // armed & close
	if (inputs.enemyDist < 35) return "survive"; // close but out of ammo → disengage
	return "patrol"; // nothing pressing
}

/** Derive the agent's current world facts from the crisp sensor inputs. */
export function deriveWorldState(inputs) {
	return {
		hasAmmo: inputs.ammo > 8,
		weaponLoaded: false,
		nearEnemy: inputs.enemyDist < 35,
		atCover: false,
		hasMedkit: false,
		healed: inputs.health > 60,
		enemyDead: false,
		patrolled: false,
	};
}

/** Does `state` satisfy every key/value in `goal`? */
function satisfies(state, goal) {
	for (const k in goal) if (state[k] !== goal[k]) return false;
	return true;
}

function stateKey(state) {
	const keys = Object.keys(state).sort();
	return keys.map((k) => `${k}:${state[k] ? 1 : 0}`).join(",");
}

/**
 * Forward A* over world states. Returns the cheapest action sequence whose
 * cumulative effects satisfy the goal, plus search metadata for the UI.
 * @returns {{found:boolean, plan:Array, cost:number, explored:number}}
 */
export function planGOAP(start, goal, actions = ACTIONS) {
	const goalKeys = Object.keys(goal);
	const heuristic = (s) => goalKeys.reduce((n, k) => n + (s[k] !== goal[k] ? 1 : 0), 0);

	const open = [{ state: start, g: 0, f: heuristic(start), plan: [] }];
	const best = new Map(); // stateKey → cheapest g seen
	let explored = 0;

	while (open.length > 0) {
		// Pick the lowest-f node (small search space → linear scan is fine).
		let bi = 0;
		for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
		const cur = open.splice(bi, 1)[0];
		explored++;

		if (satisfies(cur.state, goal)) {
			return { found: true, plan: cur.plan, cost: cur.g, explored };
		}

		const key = stateKey(cur.state);
		if (best.has(key) && best.get(key) <= cur.g) continue;
		best.set(key, cur.g);

		for (const act of actions) {
			if (!satisfies(cur.state, act.pre)) continue;
			const next = { ...cur.state, ...act.eff };
			if (stateKey(next) === key) continue; // no progress
			const g = cur.g + act.cost;
			open.push({ state: next, g, f: g + heuristic(next), plan: [...cur.plan, act] });
		}

		if (explored > 5000) break; // safety valve
	}

	return { found: false, plan: [], cost: Number.POSITIVE_INFINITY, explored };
}

// ─────────────────────────────────────────────
// DECISION ENGINE — ties the two layers together
// ─────────────────────────────────────────────

export class DecisionEngine {
	/**
	 * Run both layers for the given parameters.
	 * @param {{mode:string, goal:string, health:number, ammo:number, distEnemy:number}} params
	 */
	evaluate(params) {
		const inputs = {
			health: params.health,
			ammo: params.ammo,
			enemyDist: params.distEnemy,
		};
		const fuzzy = evaluateFuzzy(inputs);
		const world = deriveWorldState(inputs);

		// Tactical layer: plan every strategy so all branches show their GOAP queue.
		const plans = {};
		for (const s of STRATEGIES) plans[s.id] = planGOAP(world, GOAL_STATES[s.id], ACTIONS);

		// Strategy selector — compute BOTH methods so the UI can compare them.
		const binaryChoice = selectBinary(inputs);
		const fuzzyChoice = STRATEGIES.reduce((best, s) =>
			fuzzy.desirabilities[s.id] > fuzzy.desirabilities[best.id] ? s : best,
		).id;

		const chosen = params.mode === "binary" ? binaryChoice : fuzzyChoice;

		return { inputs, fuzzy, world, plans, binaryChoice, fuzzyChoice, chosen };
	}

	/**
	 * Build the force-graph hierarchy: root selector → scoped strategy boxes →
	 * planned action steps. `execStep` lights up executed actions for the chosen
	 * strategy as the user ticks through the plan.
	 */
	buildGraph(result, execStep = 0) {
		const strategyNodes = STRATEGIES.map((s) => {
			const plan = result.plans[s.id];
			const isChosen = s.id === result.chosen;

			let children;
			if (plan.found && plan.plan.length > 0) {
				children = plan.plan.map((a, i) => ({
					id: `${s.id}_${a.id}_${i}`,
					name: a.name,
					type: "action",
					status: isChosen
						? i < execStep
							? "SUCCESS"
							: i === execStep
								? "RUNNING"
								: "READY"
						: "READY",
					cost: a.cost,
					utility: 0,
					children: [],
					isExpanded: true,
				}));
			} else if (plan.found) {
				children = [
					{ id: `${s.id}_goalmet`, name: "Goal already met", type: "condition", status: "SUCCESS", utility: 0, children: [], isExpanded: true },
				];
			} else {
				children = [
					{ id: `${s.id}_noplan`, name: "⊘ No valid plan", type: "condition", status: "FAILURE", utility: 0, children: [], isExpanded: true },
				];
			}

			const done = isChosen && plan.found && execStep >= plan.plan.length;
			return {
				id: s.id,
				name: s.label,
				type: "strategy",
				isScoped: true,
				status: isChosen ? (done ? "SUCCESS" : "RUNNING") : plan.found ? "READY" : "FAILURE",
				utility: result.fuzzy.desirabilities[s.id],
				children,
				isExpanded: true,
			};
		});

		return {
			id: "root",
			name: "STRATEGY SELECTOR",
			type: "selector",
			status: "RUNNING",
			utility: 0,
			isExpanded: true,
			children: strategyNodes,
		};
	}
}
