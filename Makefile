.PHONY: all ecore ecore.install ecore.generate ecore.format ecore.build ecore.test library library.install library.generate library.build library.test version

all: image ecore library

pwd := $(CURDIR)

image:
	@docker build --file Dockerfile --tag masagroup/soft.ts.dev .

ecore: ecore.install ecore.generate ecore.format ecore.build ecore.test

ecore.install:
	@docker run --rm -v $(pwd):/pwd -w /pwd/ecore masagroup/soft.ts.dev npm install

ecore.generate:
	@docker run --rm -v $(pwd):/pwd -v $(realpath ../models):/models -w /pwd masagroup/soft.generator.ts -m /models/ecore.ecore -o /pwd -ps /pwd/generator.properties -t !generateModule

ecore.format:
	@docker run --rm -v $(pwd):/pwd -w /pwd/ecore masagroup/soft.ts.dev npm run pretty

ecore.build:
	@docker run --rm -v $(pwd):/pwd -w /pwd/ecore masagroup/soft.ts.dev npm run build

ecore.test:
	@docker run --rm -v $(pwd):/pwd -w /pwd/ecore masagroup/soft.ts.dev npm run test

library: library.install library.generate library.build library.test

library.install:
	@docker run --rm -v $(pwd):/pwd -w /pwd/library masagroup/soft.ts.dev npm install

library.generate:
	@docker run --rm -v $(pwd):/pwd -v $(realpath ../models):/models -w /pwd masagroup/soft.generator.ts -m /models/library.ecore -o /pwd -ps /pwd/generator.properties

library.build:
	@docker run --rm -v $(pwd):/pwd -w /pwd/library masagroup/soft.ts.dev npm run build

library.test:
	@docker run --rm -v $(pwd):/pwd -w /pwd/library masagroup/soft.ts.dev npm run test

ecore.ts.version := 1.0.2

version:
	@echo "update ecore package version to $(ecore.ts.version)"
	@sed -i 's#"version": "[0-9]*\.[0-9]*\.[0-9]*",#"version": "$(ecore.ts.version)",#g' ecore/package.json



