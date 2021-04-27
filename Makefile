.PHONY: all ecore ecore.install ecore.generate ecore.version ecore.format ecore.build ecore.test library library.install library.generate library.build library.test 

GENERATE = docker run --rm -v $(CURDIR):/pwd -v $(realpath ../models):/models -w /pwd masagroup/soft.generator.ts -m /models/$(1) -o /pwd/ -ps /pwd/generator.properties ${2}

# os detection
ifeq (${OS},Windows_NT)
WHICH := where
DEVNUL := NUL
else
WHICH := which
DEVNUL := /dev/null
endif

# detect go
ifneq ($(shell $(WHICH) go 2>$(DEVNUL)),)
NPM := npm
else 
ifneq ($(shell $(WHICH) go.exe 2>$(DEVNUL)),)
NPM := npm.exe
else
$(error "npm is not in your system PATH")
endif
endif


all: ecore library

ecore.ts.version := 1.0.2


ecore: ecore.install ecore.generate ecore.format ecore.build ecore.test

ecore.install:
	@echo "[ecore.install]"
	@cd ecore && @$(NPM) install --loglevel=error

ecore.generate:
	@echo "[ecore.generate]"
	@$(call GENERATE,ecore.ecore,-t !generateModule)

ecore.format:
	@echo "[ecore.format]"
	@cd ecore && @$(NPM) run pretty

ecore.build:
	@echo "[ecore.build]"
	@cd ecore && @$(NPM) run build

ecore.test:
	@echo "[ecore.test]"
	@cd ecore && @$(NPM) run test

ecore.version:
	@echo "[ecore.version]"
	@sed -i 's#"version": "[0-9]*\.[0-9]*\.[0-9]*",#"version": "$(ecore.ts.version)",#g' ecore/package.json

library: library.install library.generate library.build library.test

library.install:
	@echo "[library.install]"
	@cd library && @$(NPM) install --loglevel=error

library.generate:
	@echo "[library.generate]"
	@$(call GENERATE,library.ecore,)

library.build:
	@echo "[library.build]"
	@cd library && @$(NPM) run build

library.test:
	@echo "[library.test]"
	@cd library && @$(NPM) run test

