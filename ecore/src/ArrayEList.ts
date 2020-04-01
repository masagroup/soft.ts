import {Collection} from "./Collection";
import {EList} from "./EList";

export class ArrayEList<E> implements EList<E> {
    private v_ : E[];
    private isUnique_ : boolean;

    constructor(v:E[]=[],isUnique:boolean=false) {
        this.v_ = v;
        this.isUnique_ = isUnique;
    }
    add(e: E): boolean {
        if (this.isUnique() && this.contains(e))
            return false;

        this.doAdd(e);
        return true;
    }
    addAll(c: Collection<E>): boolean {
        if (this.isUnique()) {
            c = this.getNonDuplicates(c)
            if (c.isEmpty())
                return false;
        }
        this.doAddAll(c)
        return true
    }
    insert(index: number, e: E): boolean {
        if ( index < 0 || index > this.v_.length )
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this.v_.length );
        if (this.isUnique() && this.contains(e) )
            return false;
        this.doInsert(index,e);    
        return true
    }
    insertAll(index: number, c: Collection<E>): boolean {
        if ( index < 0 || index > this.v_.length )
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this.v_.length );
        if (this.isUnique()){
            c = this.getNonDuplicates(c);
            if ( c.isEmpty() )
                return false;
        }
        this.doInsertAll(index,c);
        return true;
    }
    remove(e: E): boolean {
        var index = this.indexOf(e)
        if (index == -1)
            return false;
        this.removeAt(index);    
	    return true
    }
    removeAt(index: number): E {
        if (index < 0 || index >= this.v_.length )
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this.v_.length );
        var e = this.v_[index];
        this.v_.splice(index, 1);
        this.didRemove(index,e);
        this.didChange();
        return e;
    }
    removeAll(c: Collection<E>): boolean {
        var modified = false;
        for ( let i = this.size(); --i >= 0; )
        {
            if (c.contains(this.v_[i]))
            {
                this.removeAt(i);
                modified = true;
            }
        }
        return modified;
    }
    retainAll(c: Collection<E>): boolean {
        var modified = false;
        for ( let i = this.size(); --i >= 0; )
        {
            if (!c.contains(this.v_[i]))
            {
                this.removeAt(i);
                modified = true;
            }
        }
        return modified;
    }
    get(index: number): E {
        if (index < 0 || index >= this.v_.length)
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this.v_.length );
        return this.v_[index]
    }
    set(index: number, e: E): void {
        if (index < 0 || index >= this.v_.length)
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this.v_.length );
            this.doSet(index,e);
    }
    indexOf(e: E): number {
        return this.v_.indexOf(e);
    }    
    clear(): void {
        this.v_ = [];
    }
    contains(e: E): boolean {
        return this.v_.includes(e);
    }
    isEmpty(): boolean {
        return this.v_.length == 0;
    }
    size(): number {
        return this.v_.length;
    }
    toArray(): E[] {
        return this.v_;
    }
    [Symbol.iterator](): Iterator<E, any, undefined> {
        return this.v_[Symbol.iterator]();
    }

    protected isUnique() : boolean {
        return false;
    }
    protected getNonDuplicates(c:Collection<E>):Collection<E> {
        var l = new ArrayEList<E>();
        for (const e of c) {
            if (!l.contains(e) && !this.contains(e))
                l.add(e);
        }
        return l;
    }
    protected doAdd(e:E):void {
        var size = this.v_.length;
        this.v_.push(e);
        this.didAdd(size,e);
        this.didChange();
    }
    protected doAddAll(c:Collection<E>):boolean {
        var oldSize = this.v_.length;
        this.v_.push(...c.toArray());
        for (let i = oldSize; i < this.v_.length; i++) {
            this.didAdd(i ,this.v_[i]);
            this.didChange();
        }
        return !c.isEmpty();
    }
    protected doInsert(index:number,e:E) : void {
        this.v_.splice(index,0,e);
        this.didAdd(index,e);
        this.didChange();
    }
    protected doInsertAll(index:number,c:Collection<E>) : boolean {
        this.v_.splice(index,0,...c.toArray());
        for (let i = index; i < index + c.size(); i++) {
            this.didAdd(i ,this.v_[i]);
            this.didChange();
        }
        return !c.isEmpty();
    }
    protected doSet(index:number,e:E) : E {
        var o = this.v_[index];
        this.v_[index] = e;
        this.didSet(index,o,e);
        this.didChange();
        return o;
    }
    protected didAdd(index:number,e:E):void {
    }
    protected didRemove(index:number,e:E):void {
    }
    protected didSet(index:number,newE:E,oldE:E):void {
    }
    protected didChange():void {
    }
}
