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


// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/core/routing/History",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast",
//     "sap/ui/model/json/JSONModel"
// ], function (Controller, History, MessageBox, MessageToast, JSONModel) {
//     "use strict";

//     return Controller.extend("purchaseorder.poorder.controller.Detail", {

//         /* =========================================================== */
//         /* Lifecycle Methods                                           */
//         /* =========================================================== */

//         onInit: function () {
//             var oRouter = this.getOwnerComponent().getRouter();
//             oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);

//             // Local view model to handle Edit/Read-only state
//             var oViewModel = new JSONModel({
//                 isEditable: false
//             });
//             this.getView().setModel(oViewModel, "viewModel");

//             // [NEW] Track modified rows to send only changed data
//             this._oModifiedPaths = new Set(); 
//         },

//         _onObjectMatched: function (oEvent) {
//             var sPurchaseOrder = oEvent.getParameter("arguments").PurchaseOrder;
//             this.getView().bindElement({
//                 path: "/zi_p2p_PO_HEAD('" + sPurchaseOrder + "')"
//             });
//             // Clear modified tracking when loading a new page
//             this._oModifiedPaths.clear();
//         },

//         /* =========================================================== */
//         /* Edit Mode Logic                                             */
//         /* =========================================================== */

//         onEditPress: function () {
//             this.getView().getModel("viewModel").setProperty("/isEditable", true);
//         },

//         onCancelPress: function () {
//             var oModel = this.getView().getModel();
//             if (oModel.hasPendingChanges()) {
//                 oModel.resetChanges();
//             }
//             this.getView().getModel("viewModel").setProperty("/isEditable", false);
//             this._oModifiedPaths.clear(); // Reset tracking
//         },

//         /* =========================================================== */
//         /* Data Handling & Tracking                                    */
//         /* =========================================================== */

//         // [NEW] Generic handler for standard Inputs (Driver, Vehicle, etc.)
//         onFieldChange: function(oEvent) {
//             var oCtx = oEvent.getSource().getBindingContext();
//             // Mark this row path as modified
//             this._oModifiedPaths.add(oCtx.getPath());
//         },

//         // Handler for StepInput (Quantity)
//         onQuantityChange: function(oEvent) {
//             var oStepInput = oEvent.getSource();
//             var fValue = oStepInput.getValue(); 
//             var oCtx = oStepInput.getBindingContext();
//             var sPath = oCtx.getPath();
            
//             // 1. Force update the model with String value
//             this.getView().getModel().setProperty(sPath + "/GateReceivedQuantity", String(fValue));

//             // 2. [NEW] Mark this row as modified
//             this._oModifiedPaths.add(sPath);
//         },

//         /* =========================================================== */
//         /* Push Logic                                                  */
//         /* =========================================================== */

//         onPushData: function () {
//             var oView = this.getView();
//             var oModel = oView.getModel();
//             var oViewModel = oView.getModel("viewModel");

//             // 1. Check if we have any modified items
//             if (this._oModifiedPaths.size === 0) {
//                 MessageBox.information("No changes detected to push.");
//                 return;
//             }

//             // 2. Get Header Data
//             var oHeaderCtx = oView.getBindingContext();
//             if (!oHeaderCtx) {
//                 MessageBox.error("No Header data loaded.");
//                 return;
//             }
//             var oHeaderData = oHeaderCtx.getObject();

//             // 3. Get All Items from the Table
//             var oTable = oView.byId("itemsTable");
//             var aContexts = oTable.getBinding("items").getContexts(); 
//             var aPayloadItems = [];

//             // 4. Loop through ALL items, but only add the MODIFIED ones
//             for (var i = 0; i < aContexts.length; i++) {
//                 var sPath = aContexts[i].getPath();

//                 // [FILTER] Only add if this path was marked as modified
//                 if (this._oModifiedPaths.has(sPath)) {
//                     var oItemData = aContexts[i].getObject();

//                     var oItemPayload = {
//                         "PurchaseOrder":              oItemData.PurchaseOrder,
//                         "PurchaseOrderItem":          oItemData.PurchaseOrderItem,
//                         "PurchasingDocumentCategory": oItemData.PurchasingDocumentCategory,
//                         "Material":                   oItemData.Material,
//                         "Product":                    oItemData.Product,
//                         "Plant":                      oItemData.Plant,
//                         "StorageLocation":            oItemData.StorageLocation,
//                         "MaterialGroup":              oItemData.MaterialGroup,
//                         "ProductGroup":               oItemData.ProductGroup,
//                         "OrderQuantity":              oItemData.OrderQuantity,
//                         "OrderQuantityUnit":          oItemData.OrderQuantityUnit,
//                         "OpenQuantity":               oItemData.OpenQuantity,
//                         "GrQuantity":                 oItemData.GrQuantity,
//                         "GateReceivedQuantity":       String(oItemData.GateReceivedQuantity), 
//                         "drivername":                 oItemData.drivername || "",
//                         "mobile":                     oItemData.mobile || "",
//                         "comments":                   oItemData.comments || "",
//                         "vehiclenumber":              oItemData.vehiclenumber || ""
//                     };

//                     aPayloadItems.push(oItemPayload);
//                 }
//             }

//             // 5. Construct the Payload (Header + Modified Items Only)
//             var oDeepPayload = {
//                 "PurchaseOrder":              oHeaderData.PurchaseOrder,
//                 "PurchaseOrderType":          oHeaderData.PurchaseOrderType,
//                 "CompanyCode":                oHeaderData.CompanyCode,
//                 "PurchasingDocumentCategory": oHeaderData.PurchasingDocumentCategory,
//                 "Supplier":                   oHeaderData.Supplier,
//                 "SupplierName":               oHeaderData.SupplierName,
//                 "Plant":                      oHeaderData.Plant,
//                 "to_PurchaseOrderItem":       aPayloadItems
//             };

//             // 6. Send POST Request
//             sap.ui.core.BusyIndicator.show(0);
            
//             oModel.create("/zi_p2p_PO_HEAD", oDeepPayload, {
//                 success: function (oData) {
//                     sap.ui.core.BusyIndicator.hide();
//                     MessageToast.show("Update Successful!");
//                     oViewModel.setProperty("/isEditable", false);
                    
//                     // Clear the modification tracker
//                     this._oModifiedPaths.clear(); 

//                     // FIX FOR DUPLICATES:
//                     // We must explicitly tell the View's element binding to reload from the server.
//                     // This wipes out the "duplicate" entries caused by the POST workaround.
//                     var oViewBinding = this.getView().getElementBinding();
//                     if (oViewBinding) {
//                         oViewBinding.refresh(true);
//                     }

//                     // Also force the table to refresh
//                     var oTable = this.byId("itemsTable");
//                     if (oTable) {
//                         oTable.getBinding("items").refresh(true);
//                     }
//                 }.bind(this),// Bind 'this' to access _oModifiedPaths
//                 error: function (oError) {
//                     sap.ui.core.BusyIndicator.hide();
//                     var sMsg = "Unknown Error";
//                     try {
//                         var oBody = JSON.parse(oError.responseText);
//                         sMsg = oBody.error.message.value;
//                     } catch (e) { 
//                         sMsg = oError.message || oError.statusText;
//                     }
//                     MessageBox.error("Push Failed: " + sMsg);
//                 }
//             });
//         },

//         /* =========================================================== */
//         /* Navigation                                                  */
//         /* =========================================================== */

//         onItemPress: function(oEvent) {
//             var oItem = oEvent.getSource();
//             var oCtx = oItem.getBindingContext();
            
//             this.getOwnerComponent().getRouter().navTo("RouteSubDetail", {
//                 PurchaseOrder: oCtx.getProperty("PurchaseOrder"),
//                 PurchaseOrderItem: oCtx.getProperty("PurchaseOrderItem")
//             });
//         },

//         onNavBack: function () {
//             var oHistory = History.getInstance();
//             var sPreviousHash = oHistory.getPreviousHash();
//             if (sPreviousHash !== undefined) {
//                 window.history.go(-1);
//             } else {
//                 this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
//             }
//         }
//     });
// });



/* =========================================================== */
/*           VERSION 2                                         */
/* =========================================================== */



// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/core/routing/History",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast",
//     "sap/ui/model/json/JSONModel",
//     "sap/ui/core/BusyIndicator"
// ], function (
//     Controller,
//     History,
//     MessageBox,
//     MessageToast,
//     JSONModel,
//     BusyIndicator
// ) {
//     "use strict";

//     return Controller.extend("purchaseorder.poorder.controller.Detail", {

//         /* =========================================================== */
//         /* Lifecycle                                                   */
//         /* =========================================================== */

//         onInit: function () {
//             var oRouter = this.getOwnerComponent().getRouter();
//             oRouter.getRoute("RouteDetail")
//                 .attachPatternMatched(this._onObjectMatched, this);

//             // View model for edit state
//             var oViewModel = new JSONModel({
//                 isEditable: false
//             });
//             this.getView().setModel(oViewModel, "viewModel");

//             // Track modified rows
//             this._oModifiedPaths = new Set();
//         },

//         _onObjectMatched: function (oEvent) {
//             var sPurchaseOrder = oEvent.getParameter("arguments").PurchaseOrder;

//             this.getView().bindElement({
//                 path: "/zi_p2p_PO_HEAD('" + sPurchaseOrder + "')"
//             });

//             this._oModifiedPaths.clear();
//             this.getView().getModel("viewModel").setProperty("/isEditable", false);
//         },

//         /* =========================================================== */
//         /* Edit / Cancel                                               */
//         /* =========================================================== */

//         onEditPress: function () {
//             var oViewModel = this.getView().getModel("viewModel");

//             if (!oViewModel.getProperty("/isEditable")) {
//                 oViewModel.setProperty("/isEditable", true);

//                 MessageToast.show(
//                     "Edit mode enabled. Make your changes and save before pushing.",
//                     { duration: 3000 }
//                 );
//             }
//         },

//         onCancelPress: function () {
//             var oModel = this.getView().getModel();

//             if (oModel.hasPendingChanges()) {
//                 oModel.resetChanges();
//             }

//             this._oModifiedPaths.clear();
//             this.getView().getModel("viewModel").setProperty("/isEditable", false);

//             MessageToast.show("Changes have been discarded.");
//         },

//         /* =========================================================== */
//         /* Change Tracking                                             */
//         /* =========================================================== */

//         onFieldChange: function (oEvent) {
//             var oCtx = oEvent.getSource().getBindingContext();
//             if (oCtx) {
//                 this._oModifiedPaths.add(oCtx.getPath());
//             }
//         },

//         onQuantityChange: function (oEvent) {
//             var oInput = oEvent.getSource();
//             var oCtx = oInput.getBindingContext();

//             if (!oCtx) {
//                 return;
//             }

//             var sPath = oCtx.getPath();
//             var fValue = oInput.getValue();

//             this.getView()
//                 .getModel()
//                 .setProperty(sPath + "/GateReceivedQuantity", String(fValue));

//             this._oModifiedPaths.add(sPath);
//         },

//         /* =========================================================== */
//         /* Push Flow                                                   */
//         /* =========================================================== */

//         onPushData: function () {

//             // 1️⃣ No changes → info popup
//             if (this._oModifiedPaths.size === 0) {
//                 MessageBox.information(
//                     "No changes detected. Please make changes before pushing."
//                 );
//                 return;
//             }

//             // 2️⃣ Confirm push
//             MessageBox.confirm(
//                 "Do you want to push the changes?",
//                 {
//                     title: "Confirm Push",
//                     actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
//                     emphasizedAction: MessageBox.Action.OK,
//                     onClose: function (sAction) {
//                         if (sAction === MessageBox.Action.OK) {
//                             this._executePush();
//                         }
//                     }.bind(this)
//                 }
//             );
//         },

//         /* =========================================================== */
//         /* Execute Push                                                */
//         /* =========================================================== */

//         _executePush: function () {
//             var oView = this.getView();
//             var oModel = oView.getModel();
//             var oViewModel = oView.getModel("viewModel");

//             var oHeaderCtx = oView.getBindingContext();
//             if (!oHeaderCtx) {
//                 MessageBox.error("Header data not available.");
//                 return;
//             }

//             var oHeaderData = oHeaderCtx.getObject();
//             var oTable = oView.byId("itemsTable");
//             var aContexts = oTable.getBinding("items").getContexts();

//             var aPayloadItems = [];

//             aContexts.forEach(function (oCtx) {
//                 if (this._oModifiedPaths.has(oCtx.getPath())) {
//                     var oItem = oCtx.getObject();

//                     aPayloadItems.push({
//                         PurchaseOrder: oItem.PurchaseOrder,
//                         PurchaseOrderItem: oItem.PurchaseOrderItem,
//                         GateReceivedQuantity: String(oItem.GateReceivedQuantity),
//                         drivername: oItem.drivername || "",
//                         mobile: oItem.mobile || "",
//                         vehiclenumber: oItem.vehiclenumber || "",
//                         comments: oItem.comments || ""
//                     });
//                 }
//             }.bind(this));

//             var oPayload = {
//                 PurchaseOrder: oHeaderData.PurchaseOrder,
//                 to_PurchaseOrderItem: aPayloadItems
//             };

//             BusyIndicator.show(0);

//             oModel.create("/zi_p2p_PO_HEAD", oPayload, {
//                 success: function () {
//                     BusyIndicator.hide();

//                     MessageBox.success(
//                         "Changes pushed successfully.",
//                         { title: "Success" }
//                     );

//                     this._oModifiedPaths.clear();
//                     oViewModel.setProperty("/isEditable", false);

//                     oView.getElementBinding().refresh(true);
//                     oTable.getBinding("items").refresh(true);
//                 }.bind(this),

//                 error: function (oError) {
//                     BusyIndicator.hide();

//                     var sMessage = "Push failed.";
//                     try {
//                         sMessage = JSON.parse(oError.responseText)
//                             .error.message.value;
//                     } catch (e) {}

//                     MessageBox.error(sMessage, {
//                         title: "Push Failed"
//                     });
//                 }
//             });
//         },

//         /* =========================================================== */
//         /* Navigation                                                  */
//         /* =========================================================== */

//         onItemPress: function (oEvent) {
//             var oCtx = oEvent.getSource().getBindingContext();

//             this.getOwnerComponent().getRouter().navTo("RouteSubDetail", {
//                 PurchaseOrder: oCtx.getProperty("PurchaseOrder"),
//                 PurchaseOrderItem: oCtx.getProperty("PurchaseOrderItem")
//             });
//         },

//         onNavBack: function () {
//             var oHistory = History.getInstance();
//             var sPreviousHash = oHistory.getPreviousHash();

//             if (sPreviousHash !== undefined) {
//                 window.history.go(-1);
//             } else {
//                 this.getOwnerComponent().getRouter()
//                     .navTo("RouteList", {}, true);
//             }
//         }

//     });
// });



/* =========================================================== */
/*           VERSION 3                                         */
/* =========================================================== */



sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator"
], function (
    Controller,
    History,
    MessageBox,
    MessageToast,
    JSONModel,
    BusyIndicator
) {
    "use strict";

    return Controller.extend("purchaseorder.poorder.controller.Detail", {

        /* =========================================================== */
        /* Lifecycle                                                   */
        /* =========================================================== */

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail")
                .attachPatternMatched(this._onObjectMatched, this);

            this.getView().setModel(new JSONModel({
                isEditable: false
            }), "viewModel");

            this._oModifiedPaths = new Set();
        },

        _onObjectMatched: function (oEvent) {
            var sPO = oEvent.getParameter("arguments").PurchaseOrder;

            this.getView().bindElement({
                path: "/zi_p2p_PO_HEAD('" + sPO + "')"
            });

            this._oModifiedPaths.clear();
            this.getView().getModel("viewModel").setProperty("/isEditable", false);
        },

        /* =========================================================== */
        /* Edit / Cancel                                               */
        /* =========================================================== */

        onEditPress: function () {
            var oVM = this.getView().getModel("viewModel");
            if (!oVM.getProperty("/isEditable")) {
                oVM.setProperty("/isEditable", true);
                MessageToast.show("Edit mode enabled.");
            }
        },

        onCancelPress: function () {
            var oModel = this.getView().getModel();

            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
            }

            this._oModifiedPaths.clear();
            this.getView().getModel("viewModel").setProperty("/isEditable", false);
            MessageToast.show("Changes discarded.");
        },

        /* =========================================================== */
        /* Change Tracking                                             */
        /* =========================================================== */

        onFieldChange: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            if (oCtx) {
                this._oModifiedPaths.add(oCtx.getPath());
            }
        },

        onQuantityChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var oCtx = oInput.getBindingContext();
            if (!oCtx) {
                return;
            }

            var sPath = oCtx.getPath();
            var fGateQty = Number(oInput.getValue()) || 0;

            this.getView().getModel()
                .setProperty(sPath + "/GateReceivedQuantity", String(fGateQty));

            this._oModifiedPaths.add(sPath);
        },

        /* =========================================================== */
        /* Push Flow                                                   */
        /* =========================================================== */

        onPushData: function () {
            if (this._oModifiedPaths.size === 0) {
                MessageBox.information("No changes detected.");
                return;
            }

            MessageBox.confirm("Do you want to push the changes?", {
                title: "Confirm Push",
                emphasizedAction: MessageBox.Action.OK,
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._executePush();
                    }
                }.bind(this)
            });
        },

        _executePush: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oVM = oView.getModel("viewModel");

            var oHeader = oView.getBindingContext().getObject();
            var oTable = oView.byId("itemsTable");
            var aContexts = oTable.getBinding("items").getContexts();

            var aItems = [];

            aContexts.forEach(function (oCtx) {
                if (this._oModifiedPaths.has(oCtx.getPath())) {
                    var oItem = oCtx.getObject();

                    aItems.push({
                        PurchaseOrder: oItem.PurchaseOrder,
                        PurchaseOrderItem: oItem.PurchaseOrderItem,
                        GateReceivedQuantity: String(oItem.GateReceivedQuantity),
                        drivername: oItem.drivername || "",
                        mobile: oItem.mobile || "",
                        vehiclenumber: oItem.vehiclenumber || "",
                        comments: oItem.comments || "",
                        InvoiceNumber: oItem.InvoiceNumber || "",
                        InvoiceDate: oItem.InvoiceDate || null,
                        received: oItem.received === true
                    });
                }
            }.bind(this));

            BusyIndicator.show(0);

            oModel.create("/zi_p2p_PO_HEAD", {
                PurchaseOrder: oHeader.PurchaseOrder,
                to_PurchaseOrderItem: aItems
            }, {
                success: function () {
                    BusyIndicator.hide();
                    MessageBox.success("Data pushed successfully.");
                    this._oModifiedPaths.clear();
                    oVM.setProperty("/isEditable", false);
                    oView.getElementBinding().refresh(true);
                    oTable.getBinding("items").refresh(true);
                }.bind(this),
                error: function (oError) {
                    BusyIndicator.hide();
                    MessageBox.error("Push failed.");
                }
            });
        },

        /* =========================================================== */
        /* Navigation                                                  */
        /* =========================================================== */

        onItemPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            this.getOwnerComponent().getRouter().navTo("RouteSubDetail", {
                PurchaseOrder: oCtx.getProperty("PurchaseOrder"),
                PurchaseOrderItem: oCtx.getProperty("PurchaseOrderItem")
            });
        },

        onNavBack: function () {
            var sPrev = History.getInstance().getPreviousHash();
            if (sPrev !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter()
                    .navTo("RouteList", {}, true);
            }
        }

    });
});
