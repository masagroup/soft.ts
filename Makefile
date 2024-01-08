# *****************************************************************************
# Copyright(c) 2021 MASA Group
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# *****************************************************************************

ECORE_TS_VERSION := 1.0.4

GENERATE = docker run --rm -v $(CURDIR):/pwd -v $(realpath ../models):/models -w /pwd masagroup/soft.generator.ts -m /models/$(1) -o /pwd/ -P /pwd/generator.properties ${2}

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
all: ecore library

.PHONY: ci
ci: ecore.ci library.ci

.PHONY: ecore
ecore: ecore.install ecore.generate ecore.format ecore.build ecore.test

.PHONY: ecore.ci
ecore.ci: ecore.install ecore.generate ecore.build ecore.test

.PHONY: ecore.install
ecore.install:
	@echo "[ecore.install]"
	@(cd ecore && $(NPM) install --no-fund --loglevel=error)

.PHONY: ecore.generate
ecore.generate:
	@echo "[ecore.generate]"
	@$(call GENERATE,ecore.ecore,-t generateModel -t generateTests)

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

.PHONY: library
library: library.install library.generate library.format library.build library.test

.PHONY: library.ci
ecore.ci: library.install library.generate library.build library.test


.PHONY: library.install
library.install:
	@echo "[library.install]"
	@(cd library && $(NPM) install --no-fund --loglevel=error)

.PHONY: library.generate
library.generate:
	@echo "[library.generate]"
	@$(call GENERATE,library.ecore,)

.PHONY: library.format
library.format:
	@echo "[library.format]"
	@(cd library && $(NPM) run pretty)

.PHONY: library.build
library.build:
	@echo "[library.build]"
	@(cd library && $(NPM) run build)

.PHONY: library.test
library.test:
	@echo "[library.test]"
	@(cd library && $(NPM) run test)

.PHONY: versions
versions:
	@echo "[ecore.version]"
	@sed -i 's#"version": "[0-9]*\.[0-9]*\.[0-9]*",#"version": "$(ECORE_TS_VERSION)",#g' ecore/package.json

