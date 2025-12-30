sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"  // [1] Import JSONModel
], function (Controller, History, JSONModel) {
    "use strict";

    return Controller.extend("purchaseorder.poorder.controller.SubDetail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteSubDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sPurchaseOrder = oArgs.PurchaseOrder;
            var sPurchaseOrderItem = oArgs.PurchaseOrderItem;

            // 1. Construct the path to the Item (Header area)
            var sPath = "/zi_p2p_PO_Item(PurchaseOrder='" + sPurchaseOrder + "',PurchaseOrderItem='" + sPurchaseOrderItem + "')";
            
            // Bind the View (For the ObjectHeader at the top)
            this.getView().bindElement({
                path: sPath
            });

            // 2. WORKAROUND: Manually read the "Duplicate Key" data for the Table
            var oModel = this.getOwnerComponent().getModel();
            var sNavPath = sPath + "/to_Gatepass_item_info"; // The navigation path

            // Show busy indicator on table (optional but good UX)
            var oTable = this.byId("gatePassTable");
            oTable.setBusy(true);

            oModel.read(sNavPath, {
                success: function(oData) {
                    // oData.results contains the raw array of 2 items
                    // We put this into a local JSON Model which DOES NOT care about Keys
                    var oLocalModel = new JSONModel(oData);
                    this.getView().setModel(oLocalModel, "GatePassModel");
                    oTable.setBusy(false);
                }.bind(this),
                error: function(oError) {
                    console.error("Error fetching data", oError);
                    oTable.setBusy(false);
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var sCurrentPO = this.getView().getBindingContext().getProperty("PurchaseOrder");
                this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                    PurchaseOrder: sCurrentPO
                }, true);
            }
        }
    });
});