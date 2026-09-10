/**
 * Conventional Commits: <type>(<scope>): <subject>
 * e.g. feat(users): add bulk delete  |  fix: correct header z-index
 */
export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		// Allowed commit types
		"type-enum": [
			2,
			"always",
			[
				"feat", // new feature
				"fix", // bug fix
				"chore", // maintenance, tooling, deps
				"docs", // documentation only
				"style", // formatting, no logic change
				"refactor", // code change, neither fix nor feat
				"perf", // performance improvement
				"test", // adding/fixing tests
				"build", // build system or dependencies
				"ci", // CI configuration
				"revert", // revert a previous commit
			],
		],
		// feat(ui): ... — scope must be lowercase
		"scope-case": [2, "always", "lower-case"],
		// "feat: add login" — subject lowercase not enforced, but no trailing dot
		"subject-full-stop": [2, "never", "."],
		"header-max-length": [2, "always", 100],
	},
};
