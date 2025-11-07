/**
 * Lifecycle callbacks for the `page` content-type.
 */

export default {
  beforeCreate(event) {
    const { data } = event.params;
    
    // Set sortDate to current date if it's not provided (null or undefined)
    if (!data.sortDate) {
      data.sortDate = new Date();
    }
  },
};
