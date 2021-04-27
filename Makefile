.PHONY: all ecore ecore.install ecore.generate ecore.version ecore.format ecore.build ecore.test library library.install library.generate library.build library.test 

ECORE_TS_VERSION := 1.0.2

GENERATE = docker run --rm -v $(CURDIR):/pwd -v $(realpath ../models):/models -w /pwd masagroup/soft.generator.ts -m /models/$(1) -o /pwd/ -ps /pwd/generator.properties ${2}

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

all: ecore library

ecore: ecore.install ecore.generate ecore.format ecore.build ecore.test

ecore.install:
	@echo "[ecore.install]"
	@(cd ecore && $(NPM) install --no-fund --loglevel=error)

ecore.generate:
	@echo "[ecore.generate]"
	@$(call GENERATE,ecore.ecore,-t !generateModule)

ecore.format:
	@echo "[ecore.format]"
	@(cd ecore && $(NPM) run pretty)

ecore.build:
	@echo "[ecore.build]"
	@(cd ecore && $(NPM) run build)

ecore.test:
	@echo "[ecore.test]"
	@(cd ecore && $(NPM) run test)

ecore.version:
	@echo "[ecore.version]"
	@sed -i 's#"version": "[0-9]*\.[0-9]*\.[0-9]*",#"version": "$(ECORE_TS_VERSION)",#g' ecore/package.json

library: library.install library.generate library.build library.test

library.install:
	@echo "[library.install]"
	@(cd library && $(NPM) install --no-fund --loglevel=error)

library.generate:
	@echo "[library.generate]"
	@$(call GENERATE,library.ecore,)

library.build:
	@echo "[library.build]"
	@(cd library && $(NPM) run build)

library.test:
	@echo "[library.test]"
	@(cd library && $(NPM) run test)

