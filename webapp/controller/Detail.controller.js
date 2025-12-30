sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel" // [1] Import JSONModel
], function (Controller, History, MessageBox, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("purchaseorder.poorder.controller.Detail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);

            // [2] Create a local view model for UI state (Edit Mode)
            var oViewModel = new JSONModel({
                isEditable: false
            });
            this.getView().setModel(oViewModel, "viewModel");
        },

        _onObjectMatched: function (oEvent) {
            var sPurchaseOrder = oEvent.getParameter("arguments").PurchaseOrder;
            this.getView().bindElement({
                path: "/zi_p2p_PO_HEAD('" + sPurchaseOrder + "')"
            });
        },

        // --- BUTTON ACTIONS ---

        onEditPress: function () {
            this.getView().getModel("viewModel").setProperty("/isEditable", true);
        },

        onCancelPress: function () {
            var oModel = this.getView().getModel();
            // Discard pending changes
            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
            }
            // Switch back to read-only
            this.getView().getModel("viewModel").setProperty("/isEditable", false);
        },

        onPushData: function () {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("viewModel");

            if (!oModel.hasPendingChanges()) {
                MessageBox.information("No changes to push.");
                // Turn off edit mode anyway
                oViewModel.setProperty("/isEditable", false);
                return;
            }

            oModel.submitChanges({
                success: function (oData) {
                    // Check for backend errors
                    var bError = false;
                    if (oData.__batchResponses) {
                        oData.__batchResponses.forEach(function(oResponse) {
                            if (oResponse.response && oResponse.response.statusCode >= 400) {
                                bError = true;
                            }
                        });
                    }

                    if (bError) {
                        MessageBox.error("Some updates failed. Check logs.");
                    } else {
                        MessageToast.show("Saved Successfully!");
                        oViewModel.setProperty("/isEditable", false);
                        oModel.refresh();
                    }
                },
                error: function () {
                    MessageBox.error("Network Error.");
                }
            });
        },

        // --- NAVIGATION ---

        onItemPress: function(oEvent) {
            // Get the specific row context
            var oItem = oEvent.getSource(); // ColumnListItem
            var oCtx = oItem.getBindingContext();
            
            var sPurchaseOrder = oCtx.getProperty("PurchaseOrder");
            var sPurchaseOrderItem = oCtx.getProperty("PurchaseOrderItem");

            this.getOwnerComponent().getRouter().navTo("RouteSubDetail", {
                PurchaseOrder: sPurchaseOrder,
                PurchaseOrderItem: sPurchaseOrderItem
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
            }
        }
    });
});