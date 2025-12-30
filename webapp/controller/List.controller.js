sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("purchaseorder.poorder.controller.List", {
        
        onListItemPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            if (!oItem) { oItem = oEvent.getSource(); }
            
            var oCtx = oItem.getBindingContext();
            if (!oCtx) { return; }

            var sPurchaseOrder = oCtx.getProperty("PurchaseOrder");
            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                PurchaseOrder: sPurchaseOrder
            });
        },

        // [New] Search Function
        onSearch: function () {
            // 1. Get references to the input fields
            var sPO = this.byId("searchPO").getValue();
            var sSupplier = this.byId("searchSupplier").getValue();
            var sPlant = this.byId("searchPlant").getValue();
            var sCompCode = this.byId("searchCompCode").getValue();

            var aFilters = [];

            // 2. Build filters only for fields that have values
            if (sPO && sPO.length > 0) {
                aFilters.push(new Filter("PurchaseOrder", FilterOperator.Contains, sPO));
            }
            if (sSupplier && sSupplier.length > 0) {
                aFilters.push(new Filter("Supplier", FilterOperator.Contains, sSupplier));
            }
            if (sPlant && sPlant.length > 0) {
                aFilters.push(new Filter("Plant", FilterOperator.EQ, sPlant));
            }
            if (sCompCode && sCompCode.length > 0) {
                aFilters.push(new Filter("CompanyCode", FilterOperator.EQ, sCompCode));
            }

            // 3. Apply the filter to the table binding
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        }
    });
});