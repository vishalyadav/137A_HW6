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
  throw new TODO("Clause.prototype.rewrite not implemented");
};

Var.prototype.rewrite = function(subst) {
  throw new TODO("Var.prototype.rewrite not implemented");
};

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------

Subst.prototype.unify = function(term1, term2) {
  throw new TODO("Subst.prototype.unify not implemented");
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

Program.prototype.solve = function() {
  throw new TODO("Program.prototype.solve not implemented");
};

