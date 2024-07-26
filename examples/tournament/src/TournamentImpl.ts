// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as ecore from "@masagroup/ecore"
import {
    Group,
    Match,
    NamedElement,
    NamedElementImpl,
    Team,
    Tournament,
    TournamentConstants,
    getTournamentPackage
} from "./internal.js"

export class TournamentImpl extends NamedElementImpl implements Tournament {
    protected _teams: ecore.EList<Team>
    protected _groups: ecore.EList<Group>
    protected _matches: ecore.EList<Match>

    constructor() {
        super()
        this._groups = null
        this._matches = null
        this._teams = null
    }

    eStaticClass(): ecore.EClass {
        return getTournamentPackage().getTournament()
    }

    // get the value of groups
    getGroups(): ecore.EList<Group> {
        if (this._groups == null) {
            this._groups = new ecore.BasicEObjectList<Group>(
                this,
                TournamentConstants.TOURNAMENT__GROUPS,
                -1,
                true,
                true,
                false,
                false,
                false
            )
        }
        return this._groups
    }

    // set the value of groups
    setGroups(newGroups: ecore.EList<Group>) {
        const l = this.getGroups()
        l.clear()
        l.addAll(newGroups)
    }

    // get the value of matches
    getMatches(): ecore.EList<Match> {
        if (this._matches == null) {
            this._matches = new ecore.BasicEObjectList<Match>(
                this,
                TournamentConstants.TOURNAMENT__MATCHES,
                -1,
                true,
                true,
                false,
                false,
                false
            )
        }
        return this._matches
    }

    // set the value of matches
    setMatches(newMatches: ecore.EList<Match>) {
        const l = this.getMatches()
        l.clear()
        l.addAll(newMatches)
    }

    // get the value of teams
    getTeams(): ecore.EList<Team> {
        if (this._teams == null) {
            this._teams = new ecore.BasicEObjectList<Team>(
                this,
                TournamentConstants.TOURNAMENT__TEAMS,
                -1,
                true,
                true,
                false,
                false,
                false
            )
        }
        return this._teams
    }

    // set the value of teams
    setTeams(newTeams: ecore.EList<Team>) {
        const l = this.getTeams()
        l.clear()
        l.addAll(newTeams)
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case TournamentConstants.TOURNAMENT__GROUPS: {
                return this.getGroups()
            }
            case TournamentConstants.TOURNAMENT__MATCHES: {
                return this.getMatches()
            }
            case TournamentConstants.TOURNAMENT__TEAMS: {
                return this.getTeams()
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    async eGetFromIDAsync(featureID: number, resolve: boolean): Promise<any> {
        return this.eGetFromID(featureID, resolve)
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case TournamentConstants.TOURNAMENT__GROUPS: {
                const list = this.getGroups()
                list.clear()
                list.addAll(newValue as ecore.EList<Group>)
                break
            }
            case TournamentConstants.TOURNAMENT__MATCHES: {
                const list = this.getMatches()
                list.clear()
                list.addAll(newValue as ecore.EList<Match>)
                break
            }
            case TournamentConstants.TOURNAMENT__TEAMS: {
                const list = this.getTeams()
                list.clear()
                list.addAll(newValue as ecore.EList<Team>)
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case TournamentConstants.TOURNAMENT__GROUPS: {
                this.getGroups().clear()
                break
            }
            case TournamentConstants.TOURNAMENT__MATCHES: {
                this.getMatches().clear()
                break
            }
            case TournamentConstants.TOURNAMENT__TEAMS: {
                this.getTeams().clear()
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case TournamentConstants.TOURNAMENT__GROUPS: {
                return this._groups && !this._groups.isEmpty()
            }
            case TournamentConstants.TOURNAMENT__MATCHES: {
                return this._matches && !this._matches.isEmpty()
            }
            case TournamentConstants.TOURNAMENT__TEAMS: {
                return this._teams && !this._teams.isEmpty()
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }

    eBasicInverseRemove(
        otherEnd: ecore.EObject,
        featureID: number,
        notifications: ecore.ENotificationChain
    ): ecore.ENotificationChain {
        switch (featureID) {
            case TournamentConstants.TOURNAMENT__GROUPS: {
                const list = this.getGroups() as ecore.ENotifyingList<Group>
                const end = otherEnd as Group
                return list.removeWithNotification(end, notifications)
            }
            case TournamentConstants.TOURNAMENT__MATCHES: {
                const list = this.getMatches() as ecore.ENotifyingList<Match>
                const end = otherEnd as Match
                return list.removeWithNotification(end, notifications)
            }
            case TournamentConstants.TOURNAMENT__TEAMS: {
                const list = this.getTeams() as ecore.ENotifyingList<Team>
                const end = otherEnd as Team
                return list.removeWithNotification(end, notifications)
            }
            default: {
                return super.eBasicInverseRemove(otherEnd, featureID, notifications)
            }
        }
    }
}
