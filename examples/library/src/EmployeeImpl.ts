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
import { Employee, LibraryConstants, Person, PersonImpl, getLibraryPackage } from "./internal.js"

export class EmployeeImpl extends PersonImpl implements Employee {
    protected _manager: Employee

    constructor() {
        super()
        this._manager = null
    }

    eStaticClass(): ecore.EClass {
        return getLibraryPackage().getEmployee()
    }

    // get the value of manager
    get manager(): Employee {
        return this.getManager()
    }

    // set the value of manager
    set manager(newManager: Employee) {
        this.setManager(newManager)
    }

    // get the value of manager
    getManager(): Employee {
        if (this._manager != null && this._manager.eIsProxy()) {
            const oldManager = this._manager
            const newManager = this.eResolveProxy(oldManager) as Employee
            this._manager = newManager
            if (newManager != oldManager) {
                if (this.eNotificationRequired()) {
                    this.eNotify(
                        new ecore.Notification(
                            this,
                            ecore.EventType.RESOLVE,
                            LibraryConstants.EMPLOYEE__MANAGER,
                            oldManager,
                            newManager
                        )
                    )
                }
            }
        }
        return this._manager
    }

    // get the value of manager asynchronously
    async getManagerAsync(): Promise<Employee> {
        if (this._manager != null && this._manager.eIsProxy()) {
            const oldManager = this._manager
            const newManager = (await this.eResolveProxyAsync(oldManager)) as Employee
            this._manager = newManager
            if (newManager != oldManager) {
                if (this.eNotificationRequired()) {
                    this.eNotify(
                        new ecore.Notification(
                            this,
                            ecore.EventType.RESOLVE,
                            LibraryConstants.EMPLOYEE__MANAGER,
                            oldManager,
                            newManager
                        )
                    )
                }
            }
        }
        return this._manager
    }

    // set the value of manager
    setManager(newManager: Employee): void {
        const oldManager = this._manager
        this._manager = newManager
        if (this.eNotificationRequired()) {
            this.eNotify(
                new ecore.Notification(
                    this,
                    ecore.EventType.SET,
                    LibraryConstants.EMPLOYEE__MANAGER,
                    oldManager,
                    newManager
                )
            )
        }
    }

    // get the basic value of manager with no proxy resolution
    basicGetManager(): Employee {
        return this._manager
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case LibraryConstants.EMPLOYEE__MANAGER: {
                return resolve ? this.getManager() : this.basicGetManager()
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    async eGetFromIDAsync(featureID: number, resolve: boolean): Promise<any> {
        if (resolve) {
            switch (featureID) {
                case LibraryConstants.EMPLOYEE__MANAGER:
                    return this.getManagerAsync()
            }
        }
        return this.eGetFromID(featureID, resolve)
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case LibraryConstants.EMPLOYEE__MANAGER: {
                this.setManager(newValue as Employee)
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case LibraryConstants.EMPLOYEE__MANAGER: {
                this.setManager(null)
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case LibraryConstants.EMPLOYEE__MANAGER: {
                return this._manager != null
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }
}
