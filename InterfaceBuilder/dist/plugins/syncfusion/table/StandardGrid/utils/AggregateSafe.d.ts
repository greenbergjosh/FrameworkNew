import { Aggregate } from "@syncfusion/ej2-react-grids";
/**
 * !! IMPORTANT !!
 * Syncfusion Aggregate "destroy" method override
 *
 * Aggregate has a bug when a grid is in the detailTemplate of another grid
 * and then the outer grid is removed, the parent grid's Aggregate.destroy() is called before the child's.
 * The destroy() method tries to access its parent which no longer exists.
 * This causes the ej2-base/dom.js remove() function to throw "Can't call parentNode of null".
 *
 * Bug found when moving from @syncfusion/ej2-react-grid 18.2.58 to 18.4.34
 * Future versions may not require this patch so it's worth checking.
 *
 * Part of fix for CHN-399
 * Patch created Jan 2021, by Robert Blaske
 */
export declare class AggregateSafe extends Aggregate {
    constructor(parent: any, locator: any);
    destroy: () => void;
}
//# sourceMappingURL=AggregateSafe.d.ts.map