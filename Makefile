# *****************************************************************************
# Copyright(c) 2021 MASA Group
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# *****************************************************************************

ECORE_TS_VERSION := 1.0.4

GENERATE = docker run --rm -v $(CURDIR):/pwd -v $(realpath ../models):/models -w /pwd masagroup/soft.generator.ts -m /models/$(2) -o /pwd/$(1) -P /pwd/generator.properties $(3)

ifeq (${OS},Windows_NT)
DEVNULL := NUL
WHICH := where
else
DEVNULL := /dev/null
WHICH := which
endif

ifneq ($(shell npm -v 2>$(DEVNULL)),)
	# npm found
	NPM := npm
else
	# npm not found - try to find node.exe in wsl
	NODE := $(shell $(WHICH) node.exe 2>$(DEVNULL))
	NODE_PATH := $(shell dirname '$(NODE)' | sed -r 's|/mnt/([a-zA-Z])/|\1:/|g' )
	ifneq ($(NODE_PATH),)
		NPM := node.exe '$(NODE_PATH)/node_modules/npm/bin/npm-cli.js'
	else
		$(error "npm is not in your system PATH")
	endif
endif

.PHONY: all
all: ecore empty library

.PHONY: ci
ci: ecore.ci empty.ci library.ci

.PHONY: ecore
ecore: ecore.install ecore.generate ecore.format ecore.build ecore.test

.PHONY: ecore.ci
ecore.ci: ecore.install ecore.build ecore.test

.PHONY: ecore.install
ecore.install:
	@echo "[ecore.install]"
	@(cd ecore && $(NPM) install --no-fund --loglevel=error)

.PHONY: ecore.generate
ecore.generate:
	@echo "[ecore.generate]"
	@$(call GENERATE,,ecore.ecore,-t generateModel -t generateTests)

.PHONY: ecore.format
ecore.format:
	@echo "[ecore.format]"
	@(cd ecore && $(NPM) run pretty)

.PHONY: ecore.build
ecore.build:
	@echo "[ecore.build]"
	@(cd ecore && $(NPM) run build)

.PHONY: ecore.test
ecore.test:
	@echo "[ecore.test]"
	@(cd ecore && $(NPM) run test)

.PHONY: examples
examples: library empty

.PHONY: library
library: library.install library.generate library.format library.build library.test

.PHONY: library.ci
library.ci: library.install library.build library.test


.PHONY: library.install
library.install:
	@echo "[library.install]"
	@(cd examples/library && $(NPM) install --no-fund --loglevel=error)

.PHONY: library.generate
library.generate:
	@echo "[library.generate]"
	@$(call GENERATE,examples,library.ecore,-p accessors=property)

.PHONY: library.format
library.format:
	@echo "[library.format]"
	@(cd examples/library && $(NPM) run pretty)

.PHONY: library.build
library.build:
	@echo "[library.build]"
	@(cd examples/library && $(NPM) run build)

.PHONY: library.test
library.test:
	@echo "[library.test]"
	@(cd examples/library && $(NPM) run test)

.PHONY: empty
empty: empty.install empty.generate empty.format empty.build empty.test

.PHONY: empty.ci
empty.ci: empty.install empty.build empty.test

.PHONY: empty.install
empty.install:
	@echo "[empty.install]"
	@(cd examples/empty && $(NPM) install --no-fund --loglevel=error)

.PHONY: empty.generate
empty.generate:
	@echo "[empty.generate]"
	@$(call GENERATE,examples,empty.ecore,)

.PHONY: empty.format
empty.format:
	@echo "[empty.format]"
	@(cd examples/empty && $(NPM) run pretty)

.PHONY: empty.build
empty.build:
	@echo "[empty.build]"
	@(cd examples/empty && $(NPM) run build)

.PHONY: empty.test
empty.test:
	@echo "[empty.test]"
	@(cd examples/empty && $(NPM) run test)

.PHONY: versions
versions:
	@echo "[ecore.version]"
	@sed -i 's#"version": "[0-9]*\.[0-9]*\.[0-9]*",#"version": "$(ECORE_TS_VERSION)",#g' ecore/package.json

