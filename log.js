// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------

function makeSingleCopy(c) {
	if (c.args.length == 0) {
		return new Clause(c.name);
	}
	var args = [];
	c.args.map(function (v) {
		if (v instanceof Var) {
			args.push(new Var("__" + v.name + "__"));
		} else {
			args.push(makeSingleCopy(v));
		}
	});
	return new Clause(c.name, args);
}

Rule.prototype.makeCopyWithFreshVarNames = function() {
	var new_head = makeSingleCopy(this.head);
	var new_body = this.body.map(makeSingleCopy);
	return new Rule(new_head, new_body);
};

Clause.prototype.rewrite = function(subst) {
	var args = this.args.map(function (arg) {
		return arg.rewrite(subst);
	});
	return new Clause(this.name, args);
};

Var.prototype.rewrite = function(subst) {
	var new_val = subst.lookup(this.name);
	if (new_val) {
		return new_val.rewrite(subst);
	} else {
		return new Var(this.name);
	}
};

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------

Subst.prototype.unify = function(term1, term2) {
	term1 = term1.rewrite(this);
	term2 = term2.rewrite(this);
	if (term1 instanceof Var) {
		this.bind(term1.name, term2);
		return this;
	}
	if (term2 instanceof Var) {
		this.bind(term2.name, term1);
		return this;
	}
	if (term1.name === term2.name &&
		term1.args.length === term2.args.length) {
		for (var i = 0; i < term1.args.length; i++) {
			this.unify(term1.args[i], term2.args[i]);
		}
		return this;
	}
	throw new Error("unification failed");
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

function State(query, rules, rules_idx, subst, prev_state) {
	this.query = query;
	this.rules = rules;
	this.rules_idx = rules_idx;
	this.subst = subst;
	this.prev_state = prev_state;
}

function freshRules(rules) {
	var new_rules = [];
	for (var i = 0; i < rules.length; i++) {
		new_rules.push(rules[i].makeCopyWithFreshVarNames());
	}
	return new_rules
}

Program.prototype.solve = function() {
	this.rules = freshRules(this.rules);
	this.state = new State(this.query, this.rules, 0, new Subst(), null);
	return this;
};

/* BASIC APPROACH TO NEXT()
	1. Try to unify first element of query array with head of first rule,
		copy that into subst
	2a. If that unification fails, call next again, but go to the next rule
	2b. If it passes (sweet, you've satisfied at least one element of the
		query!), keep going on in the function.
	3a. If the rule that passed unification has a body, that body needs
		to be unified as well. To keep the code clean, the best way to do
		this might be to prepend this to the query array, and then call next
		again.
	3b. If the rule doesn't have a body, proceed in the function.
	4a. If there are more query elements to check, save the current state in
		case we have to backtrack, then reset the rule index to 0 and 
		makeCopyWithFreshVarNames on all the rules so we can kind of start
		anew. Make sure we're only looking at the remaining queries though!
		Now call next again.
	4b. If there are no more query elements to check, we can return the subst
		at the current state!
	5. Not done yet though. Although an answer has been returned, next can be 
		called again to try to get more answers. So we can try with the remaining
		rules. Then if we exhaust all the rules, we go back to our previous 
		state (where we saved the backtrack). This part's a bit fuzzy for me,
		but I think the previous state should be saved RIGHT AFTER one of the
		query elements has been satisfied.
	6. Fin.
*/
Program.prototype.next = function() {
	if (this.state === null) {
		return false;
	}
	if (this.state.rules_idx === this.state.rules.length) {
		this.state = this.state.prev_state;
		return this.next();
	}
	var subst;
	var rule = this.state.rules[this.state.rules_idx++];
	try {
		subst = this.state.subst.clone();
		subst = subst.unify(this.state.query[0], rule.head);
	} catch (e) {
		return this.next();
	}
	if (rule.body.length || this.state.query.length > 1) {
		var new_query = this.state.query.slice(1);
		if (rule.body.length) {
			new_query = rule.body.concat(new_query);
		}
		var new_rules = freshRules(this.state.rules);
		var new_state = new State(new_query, new_rules, 0, subst, this.state);
		this.state = new_state;
		return this.next();
	}
	return subst;
};

