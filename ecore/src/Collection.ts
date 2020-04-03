

export interface Collection<E> extends Iterable<E> 
{
    add(e:E):boolean;
    addAll(c:Collection<E>):boolean;
    clear():void;
    contains(e:E):boolean;
    isEmpty():boolean;
    remove(e:E):boolean;
    removeAll(c:Collection<E>):boolean;
    retainAll(c:Collection<E>):boolean;
    size():number;
    toArray():E[];
}
