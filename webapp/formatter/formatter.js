sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Open Quantity = Ordered Quantity - GR Quantity
         * Display-only calculation
         */
        openQuantity: function (vOrderedQty, vGrQty) {
            var fOrdered = Number(vOrderedQty) || 0;
            var fGr = Number(vGrQty) || 0;

            var fOpen = fOrdered - fGr;
            return fOpen < 0 ? 0 : fOpen;
        }
    };
});
