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
			args.push(new Var("__" + c.args[0].name + "__"));
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

Program.prototype.solve = function() {
  throw new TODO("Program.prototype.solve not implemented");
};

