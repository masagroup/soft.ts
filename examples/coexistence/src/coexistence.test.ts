// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as ecore from "@masagroup/ecore";
import { afterEach, describe, expect, test } from "vitest";
import * as reflective from "./reflective/internal.js";
import {
  getTournamentPackage,
  Group,
  MatchKind,
  Team,
  Tournament,
  TournamentFactory,
} from "./tournament/index.js";
import * as typed from "./typed/internal.js";

// a resource set using one implementation of the shared tournament package
function newResourceSet(
  install: (registry: ecore.EPackageRegistry) => void,
): ecore.EResourceSet {
  const rs = new ecore.EResourceSetImpl();
  install(rs.getPackageRegistry());
  return rs;
}

function newTournament(factory: TournamentFactory): Tournament {
  const tournament = factory.createTournament();
  tournament.setName("world cup");
  const group = factory.createGroup();
  group.setName("A");
  tournament.getGroups().add(group);
  for (const name of ["France", "Brazil"]) {
    const team = factory.createTeam();
    team.setName(name);
    tournament.getTeams().add(team);
    group.getTeams().add(team);
  }
  const match = factory.createMatch();
  match.setKind(MatchKind.FINAL);
  match.setHomeTeam(tournament.getTeams().get(0));
  match.setGuestTeam(tournament.getTeams().get(1));
  tournament.getMatches().add(match);
  return tournament;
}

describe("coexistence", () => {
  afterEach(() => ecore.setImplementationChecks(false));

  test("the implementations share the package and its classes", () => {
    const pack = getTournamentPackage();
    const typedTeam = typed.getFactory().createTeam();
    const reflectiveTeam = reflective.getFactory().createTeam();
    expect(typedTeam).toBeInstanceOf(typed.TeamImpl);
    expect(reflectiveTeam).toBeInstanceOf(reflective.TeamImpl);
    expect(typedTeam.eClass()).toBe(pack.getTeam());
    expect(reflectiveTeam.eClass()).toBe(pack.getTeam());
    expect(typed.getFactory().getEPackage()).toBe(pack);
    expect(reflective.getFactory().getEPackage()).toBe(pack);
    expect(ecore.getObjectFactory(typedTeam)).toBe(typed.getFactory());
    expect(ecore.getObjectFactory(reflectiveTeam)).toBe(
      reflective.getFactory(),
    );
    // the factory instance of the package builds the data types only
    expect(pack.getEFactoryInstance()).not.toBe(typed.getFactory());
    expect(() => pack.getEFactoryInstance().create(pack.getTeam())).toThrow(
      "no implementation chosen",
    );
    expect(
      typed.getFactory().convertToString(pack.getMatchKind(), MatchKind.FINAL),
    ).toBe(
      pack
        .getEFactoryInstance()
        .convertToString(pack.getMatchKind(), MatchKind.FINAL),
    );
  });

  test.each(["xml", "bin"])(
    "a %s resource is loaded with the implementation of the resource set",
    (ext) => {
      const source = newResourceSet(typed.install).createResource(
        new ecore.URI("source." + ext),
      );
      source.eContents().add(newTournament(typed.getFactory()));
      const target = newResourceSet(reflective.install).createResource(
        new ecore.URI("target." + ext),
      );
      if (ext == "xml") {
        target.loadFromString(source.saveToString());
      } else {
        target.loadFromBuffer(source.saveToBuffer());
      }
      expect(target.getErrors().isEmpty()).toBeTruthy();

      const tournament = target.eContents().get(0) as Tournament;
      expect(tournament).toBeInstanceOf(reflective.TournamentImpl);
      expect(tournament.getName()).toBe("world cup");
      const teams = tournament.getTeams();
      expect(teams.size()).toBe(2);
      for (const team of teams) {
        expect(team).toBeInstanceOf(reflective.TeamImpl);
      }
      const group = tournament.getGroups().get(0);
      expect(group).toBeInstanceOf(reflective.GroupImpl);
      expect(group.getTeams().toArray()).toEqual(teams.toArray());
      expect(teams.get(0).getGroup()).toBe(group);
      const match = tournament.getMatches().get(0);
      expect(match.getKind()).toBe(MatchKind.FINAL);
      expect(match.getHomeTeam()).toBe(teams.get(0));
      expect(match.getGuestTeam()).toBe(teams.get(1));
    },
  );

  test("a copy keeps the implementation", () => {
    const tournament = newTournament(reflective.getFactory());
    const copy = ecore.EcoreUtils.copy(tournament) as Tournament;
    expect(copy).toBeInstanceOf(reflective.TournamentImpl);
    expect(copy.getTeams().get(0)).toBeInstanceOf(reflective.TeamImpl);
    expect(copy.getMatches().get(0).getHomeTeam()).toBe(copy.getTeams().get(0));
  });

  test("loading without an implementation fails", () => {
    const source = newResourceSet(typed.install).createResource(
      new ecore.URI("source.xml"),
    );
    source.eContents().add(newTournament(typed.getFactory()));
    const rs = new ecore.EResourceSetImpl();
    rs.getPackageRegistry().registerPackage(getTournamentPackage());
    const target = rs.createResource(new ecore.URI("target.xml"));
    let failed = false;
    try {
      target.loadFromString(source.saveToString());
      failed = !target.getErrors().isEmpty();
    } catch {
      failed = true;
    }
    expect(failed).toBeTruthy();
  });

  test("objects of two implementations are not mixed when checked", () => {
    const typedGroup: Group = typed.getFactory().createGroup();
    const reflectiveTeam: Team = reflective.getFactory().createTeam();
    // not checked by default
    reflectiveTeam.setGroup(typedGroup);
    reflectiveTeam.setGroup(null);

    ecore.setImplementationChecks(true);
    const typedTeam: Team = typed.getFactory().createTeam();
    const reflectiveGroup: Group = reflective.getFactory().createGroup();
    // generated setter of a bidirectional reference
    expect(() => typedTeam.setGroup(reflectiveGroup)).toThrow(
      "cannot mix implementations",
    );
    // reflective setter
    expect(() => reflectiveTeam.setGroup(typedGroup)).toThrow(
      "cannot mix implementations",
    );
    // lists
    expect(() => typedGroup.getTeams().add(reflectiveTeam)).toThrow(
      "cannot mix implementations",
    );
    expect(() =>
      reflective.getFactory().createTournament().getTeams().add(typedTeam),
    ).toThrow("cannot mix implementations");
    // same implementation
    typedTeam.setGroup(typed.getFactory().createGroup());
    reflectiveTeam.setGroup(reflectiveGroup);
  });
});
