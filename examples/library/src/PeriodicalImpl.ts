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
import { Item, ItemImpl, LibraryConstants, Periodical, getLibraryPackage } from "./internal.js"

export class PeriodicalImpl extends ItemImpl implements Periodical {
    protected _title: string
    protected _issuesPerYear: number

    constructor() {
        super()
        this._issuesPerYear = 0
        this._title = ""
    }

    eStaticClass(): ecore.EClass {
        return getLibraryPackage().getPeriodical()
    }

    // get the value of issuesPerYear
    get issuesPerYear(): number {
        return this.getIssuesPerYear()
    }

    // set the value of issuesPerYear
    set issuesPerYear(newIssuesPerYear: number) {
        this.setIssuesPerYear(newIssuesPerYear)
    }

    // get the value of title
    get title(): string {
        return this.getTitle()
    }

    // set the value of title
    set title(newTitle: string) {
        this.setTitle(newTitle)
    }

    // get the value of issuesPerYear
    getIssuesPerYear(): number {
        return this._issuesPerYear
    }

    // set the value of issuesPerYear
    setIssuesPerYear(newIssuesPerYear: number): void {
        let oldIssuesPerYear = this._issuesPerYear
        this._issuesPerYear = newIssuesPerYear
        if (this.eNotificationRequired()) {
            this.eNotify(
                new ecore.Notification(
                    this,
                    ecore.EventType.SET,
                    LibraryConstants.PERIODICAL__ISSUES_PER_YEAR,
                    oldIssuesPerYear,
                    newIssuesPerYear
                )
            )
        }
    }

    // get the value of title
    getTitle(): string {
        return this._title
    }

    // set the value of title
    setTitle(newTitle: string): void {
        let oldTitle = this._title
        this._title = newTitle
        if (this.eNotificationRequired()) {
            this.eNotify(
                new ecore.Notification(
                    this,
                    ecore.EventType.SET,
                    LibraryConstants.PERIODICAL__TITLE,
                    oldTitle,
                    newTitle
                )
            )
        }
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case LibraryConstants.PERIODICAL__ISSUES_PER_YEAR: {
                return this.getIssuesPerYear()
            }
            case LibraryConstants.PERIODICAL__TITLE: {
                return this.getTitle()
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
            case LibraryConstants.PERIODICAL__ISSUES_PER_YEAR: {
                this.setIssuesPerYear(newValue as number)
                break
            }
            case LibraryConstants.PERIODICAL__TITLE: {
                this.setTitle(newValue as string)
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case LibraryConstants.PERIODICAL__ISSUES_PER_YEAR: {
                this.setIssuesPerYear(0)
                break
            }
            case LibraryConstants.PERIODICAL__TITLE: {
                this.setTitle("")
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case LibraryConstants.PERIODICAL__ISSUES_PER_YEAR: {
                return this._issuesPerYear != 0
            }
            case LibraryConstants.PERIODICAL__TITLE: {
                return this._title != ""
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }
}
