.PHONY: all test lint

all: lint test

test:
	./node_modules/.bin/mocha -R spec

.PHONY: lint
lint:
	@./node_modules/.bin/one-lint-js --backend lib

.PHONY: git-hook
git-hook:
	echo make git-pre-commit > .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit

.PHONY: git-pre-commit
git-pre-commit: lint
