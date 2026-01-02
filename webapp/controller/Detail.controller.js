// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/core/routing/History",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast",
//     "sap/ui/model/json/JSONModel"
// ], function (Controller, History, MessageBox, MessageToast, JSONModel) {
//     "use strict";

//     return Controller.extend("purchaseorder.poorder.controller.Detail", {

//         /* ======================= */
//         /* Lifecycle               */
//         /* ======================= */

//         onInit: function () {
//             var oRouter = this.getOwnerComponent().getRouter();
//             oRouter.getRoute("RouteDetail")
//                    .attachPatternMatched(this._onObjectMatched, this);

//             // View state model
//             this.getView().setModel(new JSONModel({
//                 isEditable: false
//             }), "viewModel");
//         },

//         _onObjectMatched: function (oEvent) {
//             var sPurchaseOrder = oEvent.getParameter("arguments").PurchaseOrder;

//             this.getView().bindElement({
//                 path: "/zi_p2p_PO_HEAD('" + sPurchaseOrder + "')"
//             });
//         },

//         /* ======================= */
//         /* Edit Mode               */
//         /* ======================= */

//         onEditPress: function () {
//             this.getView()
//                 .getModel("viewModel")
//                 .setProperty("/isEditable", true);
//         },

//         onCancelPress: function () {
//             var oModel = this.getView().getModel();

//             if (oModel.hasPendingChanges()) {
//                 oModel.resetChanges();
//             }

//             this.getView()
//                 .getModel("viewModel")
//                 .setProperty("/isEditable", false);
//         },

//         /* ======================= */
//         /* Quantity Change         */
//         /* ======================= */

//         onQuantityChange: function (oEvent) {
//             var oInput = oEvent.getSource();
//             var oCtx   = oInput.getBindingContext();
//             var sPath  = oCtx.getPath();

//             var vValue = oInput.getValue();

//             // OData V2 Decimal must be string
//             this.getView()
//                 .getModel()
//                 .setProperty(sPath + "/GateReceivedQuantity", String(vValue));
//         },

//         /* ======================= */
//         /* Save                    */
//         /* ======================= */

//         onPushData: function () {
//             var oModel     = this.getView().getModel();
//             var oViewModel = this.getView().getModel("viewModel");

//             if (!oModel.hasPendingChanges()) {
//                 MessageBox.information("No changes to save.");
//                 oViewModel.setProperty("/isEditable", false);
//                 return;
//             }

//             // Capture what we are sending (for verification)
//             var mPending = oModel.getPendingChanges();
//             var sPath, sTargetQty;

//             Object.keys(mPending).some(function (sCtxPath) {
//                 if (mPending[sCtxPath].GateReceivedQuantity !== undefined) {
//                     sPath = "/" + sCtxPath;
//                     sTargetQty = mPending[sCtxPath].GateReceivedQuantity;
//                     return true;
//                 }
//             });

//             sap.ui.core.BusyIndicator.show(0);

//             oModel.submitChanges({
//                 success: function (oData) {
//                     if (this._hasBatchError(oData)) {
//                         sap.ui.core.BusyIndicator.hide();
//                         MessageBox.error("Server rejected the request.");
//                         return;
//                     }

//                     // Verify persisted value (RAP-safe)
//                     if (sPath && sTargetQty !== undefined) {
//                         this._verifySave(sPath, sTargetQty, oModel, oViewModel);
//                     } else {
//                         sap.ui.core.BusyIndicator.hide();
//                         MessageToast.show("Saved successfully");
//                         oViewModel.setProperty("/isEditable", false);
//                         oModel.refresh(true);
//                     }
//                 }.bind(this),

//                 error: function () {
//                     sap.ui.core.BusyIndicator.hide();
//                     MessageBox.error("Network or server error.");
//                 }
//             });
//         },

//         /* ======================= */
//         /* Verification            */
//         /* ======================= */

//         _verifySave: function (sPath, sTargetQty, oModel, oViewModel) {
//             oModel.read(sPath, {
//                 success: function (oData) {
//                     sap.ui.core.BusyIndicator.hide();

//                     if (oData.GateReceivedQuantity == sTargetQty) {
//                         MessageToast.show("Saved successfully");
//                         oViewModel.setProperty("/isEditable", false);
//                         oModel.refresh(true);
//                     } else {
//                         MessageBox.error(
//                             "Silent backend failure detected.\n\n" +
//                             "Sent value: " + sTargetQty + "\n" +
//                             "Saved value: " + oData.GateReceivedQuantity + "\n\n" +
//                             "Cause: Unmanaged RAP update logic ignored the payload."
//                         );
//                     }
//                 },
//                 error: function () {
//                     sap.ui.core.BusyIndicator.hide();
//                     MessageBox.warning("Saved, but verification failed.");
//                 }
//             });
//         },

//         _hasBatchError: function (oData) {
//             return !!(oData && oData.__batchResponses &&
//                 oData.__batchResponses.some(function (r) {
//                     return r.response && r.response.statusCode >= 400;
//                 }));
//         },

//         /* ======================= */
//         /* Navigation               */
//         /* ======================= */

//         onItemPress: function (oEvent) {
//             var oCtx = oEvent.getSource().getBindingContext();

//             this.getOwnerComponent().getRouter().navTo("RouteSubDetail", {
//                 PurchaseOrder:     oCtx.getProperty("PurchaseOrder"),
//                 PurchaseOrderItem: oCtx.getProperty("PurchaseOrderItem")
//             });
//         },

//         onNavBack: function () {
//             var sPreviousHash = History.getInstance().getPreviousHash();
//             if (sPreviousHash !== undefined) {
//                 window.history.go(-1);
//             } else {
//                 this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
//             }
//         }
//     });
// });


sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, History, MessageBox, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("purchaseorder.poorder.controller.Detail", {

        /* =========================================================== */
        /* Lifecycle Methods                                           */
        /* =========================================================== */

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);

            // Local view model to handle Edit/Read-only state
            var oViewModel = new JSONModel({
                isEditable: false
            });
            this.getView().setModel(oViewModel, "viewModel");

            // [NEW] Track modified rows to send only changed data
            this._oModifiedPaths = new Set(); 
        },

        _onObjectMatched: function (oEvent) {
            var sPurchaseOrder = oEvent.getParameter("arguments").PurchaseOrder;
            this.getView().bindElement({
                path: "/zi_p2p_PO_HEAD('" + sPurchaseOrder + "')"
            });
            // Clear modified tracking when loading a new page
            this._oModifiedPaths.clear();
        },

        /* =========================================================== */
        /* Edit Mode Logic                                             */
        /* =========================================================== */

        onEditPress: function () {
            this.getView().getModel("viewModel").setProperty("/isEditable", true);
        },

        onCancelPress: function () {
            var oModel = this.getView().getModel();
            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
            }
            this.getView().getModel("viewModel").setProperty("/isEditable", false);
            this._oModifiedPaths.clear(); // Reset tracking
        },

        /* =========================================================== */
        /* Data Handling & Tracking                                    */
        /* =========================================================== */

        // [NEW] Generic handler for standard Inputs (Driver, Vehicle, etc.)
        onFieldChange: function(oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            // Mark this row path as modified
            this._oModifiedPaths.add(oCtx.getPath());
        },

        // Handler for StepInput (Quantity)
        onQuantityChange: function(oEvent) {
            var oStepInput = oEvent.getSource();
            var fValue = oStepInput.getValue(); 
            var oCtx = oStepInput.getBindingContext();
            var sPath = oCtx.getPath();
            
            // 1. Force update the model with String value
            this.getView().getModel().setProperty(sPath + "/GateReceivedQuantity", String(fValue));

            // 2. [NEW] Mark this row as modified
            this._oModifiedPaths.add(sPath);
        },

        /* =========================================================== */
        /* Push Logic                                                  */
        /* =========================================================== */

        onPushData: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oViewModel = oView.getModel("viewModel");

            // 1. Check if we have any modified items
            if (this._oModifiedPaths.size === 0) {
                MessageBox.information("No changes detected to push.");
                return;
            }

            // 2. Get Header Data
            var oHeaderCtx = oView.getBindingContext();
            if (!oHeaderCtx) {
                MessageBox.error("No Header data loaded.");
                return;
            }
            var oHeaderData = oHeaderCtx.getObject();

            // 3. Get All Items from the Table
            var oTable = oView.byId("itemsTable");
            var aContexts = oTable.getBinding("items").getContexts(); 
            var aPayloadItems = [];

            // 4. Loop through ALL items, but only add the MODIFIED ones
            for (var i = 0; i < aContexts.length; i++) {
                var sPath = aContexts[i].getPath();

                // [FILTER] Only add if this path was marked as modified
                if (this._oModifiedPaths.has(sPath)) {
                    var oItemData = aContexts[i].getObject();

                    var oItemPayload = {
                        "PurchaseOrder":              oItemData.PurchaseOrder,
                        "PurchaseOrderItem":          oItemData.PurchaseOrderItem,
                        "PurchasingDocumentCategory": oItemData.PurchasingDocumentCategory,
                        "Material":                   oItemData.Material,
                        "Product":                    oItemData.Product,
                        "Plant":                      oItemData.Plant,
                        "StorageLocation":            oItemData.StorageLocation,
                        "MaterialGroup":              oItemData.MaterialGroup,
                        "ProductGroup":               oItemData.ProductGroup,
                        "OrderQuantity":              oItemData.OrderQuantity,
                        "OrderQuantityUnit":          oItemData.OrderQuantityUnit,
                        "OpenQuantity":               oItemData.OpenQuantity,
                        "GrQuantity":                 oItemData.GrQuantity,
                        "GateReceivedQuantity":       String(oItemData.GateReceivedQuantity), 
                        "drivername":                 oItemData.drivername || "",
                        "mobile":                     oItemData.mobile || "",
                        "comments":                   oItemData.comments || "",
                        "vehiclenumber":              oItemData.vehiclenumber || ""
                    };

                    aPayloadItems.push(oItemPayload);
                }
            }

            // 5. Construct the Payload (Header + Modified Items Only)
            var oDeepPayload = {
                "PurchaseOrder":              oHeaderData.PurchaseOrder,
                "PurchaseOrderType":          oHeaderData.PurchaseOrderType,
                "CompanyCode":                oHeaderData.CompanyCode,
                "PurchasingDocumentCategory": oHeaderData.PurchasingDocumentCategory,
                "Supplier":                   oHeaderData.Supplier,
                "SupplierName":               oHeaderData.SupplierName,
                "Plant":                      oHeaderData.Plant,
                "to_PurchaseOrderItem":       aPayloadItems
            };

            // 6. Send POST Request
            sap.ui.core.BusyIndicator.show(0);
            
            oModel.create("/zi_p2p_PO_HEAD", oDeepPayload, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Update Successful!");
                    oViewModel.setProperty("/isEditable", false);
                    
                    // Clear the modification tracker
                    this._oModifiedPaths.clear(); 

                    // FIX FOR DUPLICATES:
                    // We must explicitly tell the View's element binding to reload from the server.
                    // This wipes out the "duplicate" entries caused by the POST workaround.
                    var oViewBinding = this.getView().getElementBinding();
                    if (oViewBinding) {
                        oViewBinding.refresh(true);
                    }

                    // Also force the table to refresh
                    var oTable = this.byId("itemsTable");
                    if (oTable) {
                        oTable.getBinding("items").refresh(true);
                    }
                }.bind(this),// Bind 'this' to access _oModifiedPaths
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var sMsg = "Unknown Error";
                    try {
                        var oBody = JSON.parse(oError.responseText);
                        sMsg = oBody.error.message.value;
                    } catch (e) { 
                        sMsg = oError.message || oError.statusText;
                    }
                    MessageBox.error("Push Failed: " + sMsg);
                }
            });
        },

        /* =========================================================== */
        /* Navigation                                                  */
        /* =========================================================== */

        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oCtx = oItem.getBindingContext();
            
            this.getOwnerComponent().getRouter().navTo("RouteSubDetail", {
                PurchaseOrder: oCtx.getProperty("PurchaseOrder"),
                PurchaseOrderItem: oCtx.getProperty("PurchaseOrderItem")
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