# *****************************************************************************
# Copyright(c) 2021 MASA Group
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# *****************************************************************************

# the generator: the docker image of soft.gen v2 at a fixed version
SOFT_GEN_VERSION = v2.0.0-alpha.3
SOFT_GEN_IMAGE ?= masagroup/soft.gen:$(SOFT_GEN_VERSION)

ifeq (${OS},Windows_NT)
DEVNULL := NUL
WHICH := where
else
DEVNULL := /dev/null
WHICH := which
# the generated files belong to the user, not to root
SOFT_GEN_USER := --user $(shell id -u):$(shell id -g)
endif

# the folder of the models, resolved once
MODELS := $(realpath ../models)

# the soft.gen ts command: the soft.gen image, this folder mounted at /soft/ts
# and the folder of the models where ../models points; another generator may
# be given on the command line (make GENERATOR="...")
GENERATOR ?= docker run --rm $(SOFT_GEN_USER) -v $(CURDIR):/soft/ts -v $(or $(MODELS),$(error "../models not found")):/soft/models -w /soft/ts $(SOFT_GEN_IMAGE) ts
# GENERATE generates typescript code from a model of ../models with the
# properties of .generator.yaml: $(call GENERATE,<output folder>,<model>,<options>),
# the output folder relative to this one (empty: here), the model a file name
# in ../models, the options extra soft.gen options (-t <template>, -p key=value)
GENERATE = $(GENERATOR) -m ../models/$(2) -o ./$(1) -P .generator.yaml $(3)
# GENERATE_EXAMPLE generates an example from its own model, examples/<name>/<name>.ecore,
# into examples: $(call GENERATE_EXAMPLE,<name>,<options>)
GENERATE_EXAMPLE = $(GENERATOR) -m examples/$(1)/$(1).ecore -o examples -P .generator.yaml $(2)

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
all: ecore empty library tournament inheritance coexistence

.PHONY: ci
ci: ecore.ci empty.ci library.ci tournament.ci inheritance.ci coexistence.ci

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
	@$(call GENERATE,,ecore.ecore,-t generateModel -t generateTests -p printWidth=140)

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

.PHONY: tournament
tournament: tournament.install tournament.generate tournament.format tournament.build tournament.test

.PHONY: tournament.ci
tournament.ci: tournament.install tournament.build tournament.test

.PHONY: tournament.install
tournament.install:
	@echo "[tournament.install]"
	@(cd examples/tournament && $(NPM) install --no-fund --loglevel=error)

.PHONY: tournament.generate
tournament.generate:
	@echo "[tournament.generate]"
	@$(call GENERATE,examples,tournament.ecore,-p async=true)

.PHONY: tournament.format
tournament.format:
	@echo "[tournament.format]"
	@(cd examples/tournament && $(NPM) run pretty)

.PHONY: tournament.build
tournament.build:
	@echo "[tournament.build]"
	@(cd examples/tournament && $(NPM) run build)

.PHONY: tournament.test
tournament.test:
	@echo "[tournament.test]"
	@(cd examples/tournament && $(NPM) run test)

.PHONY: inheritance
inheritance: inheritance.install inheritance.generate inheritance.format inheritance.build inheritance.test

.PHONY: inheritance.ci
inheritance.ci: inheritance.install inheritance.build inheritance.test

.PHONY: inheritance.install
inheritance.install:
	@echo "[inheritance.install]"
	@(cd examples/inheritance && $(NPM) install --no-fund --loglevel=error)

.PHONY: inheritance.generate
inheritance.generate:
	@echo "[inheritance.generate]"
	@$(call GENERATE_EXAMPLE,inheritance,)

.PHONY: inheritance.format
inheritance.format:
	@echo "[inheritance.format]"
	@(cd examples/inheritance && $(NPM) run pretty)

.PHONY: inheritance.build
inheritance.build:
	@echo "[inheritance.build]"
	@(cd examples/inheritance && $(NPM) run build)

.PHONY: inheritance.test
inheritance.test:
	@echo "[inheritance.test]"
	@(cd examples/inheritance && $(NPM) run test)


# one tournament package shared by two implementations : typed (fields) and reflective (store)
COEXISTENCE_PACKAGES = packages=http://mattsch.com/emf/examples/tournament=tournament\#tournament/$(1)
COEXISTENCE_GENERATE = $(call GENERATE,examples,tournament.ecore,-p packageInstance=interfaces -p packageDir=coexistence/src/$(1) -p "$(call COEXISTENCE_PACKAGES,$(2))" $(3))

.PHONY: coexistence
coexistence: coexistence.install coexistence.generate coexistence.format coexistence.build coexistence.test

.PHONY: coexistence.ci
coexistence.ci: coexistence.install coexistence.build coexistence.test

.PHONY: coexistence.install
coexistence.install:
	@echo "[coexistence.install]"
	@(cd examples/coexistence && $(NPM) install --no-fund --loglevel=error)

.PHONY: coexistence.generate
coexistence.generate:
	@echo "[coexistence.generate]"
	@$(call COEXISTENCE_GENERATE,tournament,typed,-t generateInterfaces)
	@$(call COEXISTENCE_GENERATE,typed,typed,-p paths=tournament=../tournament/internal.js -t generateImplementations -t generateTests)
	@$(call COEXISTENCE_GENERATE,reflective,reflective,-p paths=tournament=../tournament/internal.js -p featureDelegation=Reflective -t generateImplementations)

.PHONY: coexistence.format
coexistence.format:
	@echo "[coexistence.format]"
	@(cd examples/coexistence && $(NPM) run pretty)

.PHONY: coexistence.build
coexistence.build:
	@echo "[coexistence.build]"
	@(cd examples/coexistence && $(NPM) run build)

.PHONY: coexistence.test
coexistence.test:
	@echo "[coexistence.test]"
	@(cd examples/coexistence && $(NPM) run test)
