[![](https://img.shields.io/github/license/masagroup/soft.ts.svg)](https://github.com/masagroup/soft.ts/blob/master/LICENSE)
![](https://github.com/masagroup/soft.ts/actions/workflows/build_and_test.yaml/badge.svg)

# Soft TS #

Soft TS is an implementation of the EMF Ecore library in TypeScript. This library is partially generated and referenced by the [Soft TS Generator](https://github.com/masagroup/soft.gen)
 
Soft TS is part of [Soft](https://github.com/masagroup/soft) project

# Installation #
To install Ecore, use:
```shell
npm install @masagroup/ecore
```

# One shared package, several implementations #
Generated with the property `packageInstance=interfaces` of soft.gen ts (soft.gen v2) and an implementation module distinct from the interface module (`packages=<nsURI>=<interfaces>#<implementation>`), the package of a metamodel (`getXPackage`) is generated once, with its interfaces (`-t generateInterfaces`), and shared by its implementations: each implementation (`-t generateImplementations`, one run each, with the path of the interfaces in the `paths` property) holds its classes and a factory of its own (`getFactory()`), whose package is the shared one. The objects of all implementations have the same `EClass`. The factory instance of the shared package only converts data types: its `create` throws. The example `examples/coexistence` generates a typed and a reflective implementation of the tournament model (see the `coexistence.generate` target of the Makefile).

The implementation a resource set creates its objects with (XML and binary loads) is the factory registered for the nsURI in its package registry:

```typescript
const typedSet = new EResourceSetImpl()
typed.install(typedSet.getPackageRegistry()) // registerPackage(getTournamentPackage()) + registerFactory(typed.getFactory())
const reflectiveSet = new EResourceSetImpl()
reflectiveSet.getPackageRegistry().registerPackage(getTournamentPackage())
reflectiveSet.getPackageRegistry().registerFactory(reflective.getFactory())
```

There is no global default implementation: each resource set chooses its implementation in its registry. `getFactory(nsURI)` of a registry returns the registered factory, else the factory instance of the package, else the one of its delegate.

`getObjectFactory(obj)` returns the factory of the implementation of an object: copies and the entries of maps are of the implementation of the object they come from. The objects of different implementations of a shared package do not mix: containing, referencing (lists, single references, `eSet`) or adding as a root of the same resource an object of another implementation throws (`checkSameImplementation`) once `setImplementationChecks(true)` is called, in tests or debug builds. The checks are off by default and then cost a boolean test. The property `checkImplementation=false` of soft.gen ts (soft.gen v2) leaves them out of the generated setters.
