import { Aggregate } from "@syncfusion/ej2-react-grids"
import { remove } from "@syncfusion/ej2-base"

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
export class AggregateSafe extends Aggregate {
  constructor(parent: any, locator: any) {
    super(parent, locator)
  }

  destroy = () => {
    this.removeEventListener()
    // this.parent is a private member so Typescript complains
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const el = this.parent.element.querySelector(".e-gridfooter")
    // Check if "el" exists!
    el && remove(el)
  }
}
