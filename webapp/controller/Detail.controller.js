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

//             this.getView().setModel(new JSONModel({
//                 isEditable: false
//             }), "viewModel");

//             this._oModifiedPaths = new Set();
//         },

//         _onObjectMatched: function (oEvent) {
//             var sPO = oEvent.getParameter("arguments").PurchaseOrder;

//             this.getView().bindElement({
//                 path: "/zi_p2p_PO_HEAD('" + sPO + "')"
//             });

//             this._oModifiedPaths.clear();
//             this.getView().getModel("viewModel").setProperty("/isEditable", false);
//         },

//         /* =========================================================== */
//         /* Edit / Cancel                                               */
//         /* =========================================================== */

//         onEditPress: function () {
//             var oVM = this.getView().getModel("viewModel");
//             if (!oVM.getProperty("/isEditable")) {
//                 oVM.setProperty("/isEditable", true);
//                 MessageToast.show("Edit mode enabled.");
//             }
//         },

//         onCancelPress: function () {
//             var oModel = this.getView().getModel();

//             if (oModel.hasPendingChanges()) {
//                 oModel.resetChanges();
//             }

//             this._oModifiedPaths.clear();
//             this.getView().getModel("viewModel").setProperty("/isEditable", false);
//             MessageToast.show("Changes discarded.");
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
//             var fGateQty = Number(oInput.getValue()) || 0;

//             this.getView().getModel()
//                 .setProperty(sPath + "/GateReceivedQuantity", String(fGateQty));

//             this._oModifiedPaths.add(sPath);
//         },

//         /* =========================================================== */
//         /* Push Flow                                                   */
//         /* =========================================================== */

//         onPushData: function () {
//             if (this._oModifiedPaths.size === 0) {
//                 MessageBox.information("No changes detected.");
//                 return;
//             }

//             MessageBox.confirm("Do you want to push the changes?", {
//                 title: "Confirm Push",
//                 emphasizedAction: MessageBox.Action.OK,
//                 actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
//                 onClose: function (sAction) {
//                     if (sAction === MessageBox.Action.OK) {
//                         this._executePush();
//                     }
//                 }.bind(this)
//             });
//         },

//         _executePush: function () {
//             var oView = this.getView();
//             var oModel = oView.getModel();
//             var oVM = oView.getModel("viewModel");

//             var oHeaderCtx = oView.getBindingContext();
//             if (!oHeaderCtx) {
//                 MessageBox.error("Header data not available.");
//                 return;
//             }

//             // 🔹 FULL HEADER OBJECT
//             var oHeader = Object.assign({}, oHeaderCtx.getObject());

//             var oTable = oView.byId("itemsTable");
//             var aContexts = oTable.getBinding("items").getContexts();

//             var aItems = [];

//             aContexts.forEach(function (oCtx) {

//                 // Take FULL ITEM OBJECT
//                 var oItem = Object.assign({}, oCtx.getObject());

//                 // Only push modified rows (optional – keep your logic)
//                 if (this._oModifiedPaths.has(oCtx.getPath())) {

//                     // 🔹 Override only editable fields
//                     oItem.GateReceivedQuantity = String(oItem.GateReceivedQuantity);
//                     oItem.drivername = oItem.drivername || "";
//                     oItem.mobile = oItem.mobile || "";
//                     oItem.vehiclenumber = oItem.vehiclenumber || "";
//                     oItem.comments = oItem.comments || "";
//                     oItem.InvoiceNumber = oItem.InvoiceNumber || "";
//                     oItem.InvoiceDate = oItem.InvoiceDate || null;
//                     oItem.received = oItem.received === true;

//                     aItems.push(oItem);
//                 }
//             }.bind(this));

//             // 🔹 Attach full items to full header
//             oHeader.to_PurchaseOrderItem = aItems;

//             BusyIndicator.show(0);

//             oModel.create("/zi_p2p_PO_HEAD", oHeader, {
//                 success: function () {
//                     BusyIndicator.hide();
//                     MessageBox.success("Data pushed successfully.");

//                     this._oModifiedPaths.clear();
//                     oVM.setProperty("/isEditable", false);

//                     oView.getElementBinding().refresh(true);
//                     oTable.getBinding("items").refresh(true);
//                 }.bind(this),

//                 error: function (oError) {
//                     BusyIndicator.hide();

//                     var sMsg = "Push failed.";
//                     try {
//                         sMsg = JSON.parse(oError.responseText).error.message.value;
//                     } catch (e) {}

//                     MessageBox.error(sMsg);
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
//             var sPrev = History.getInstance().getPreviousHash();
//             if (sPrev !== undefined) {
//                 window.history.go(-1);
//             } else {
//                 this.getOwnerComponent().getRouter()
//                     .navTo("RouteList", {}, true);
//             }
//         }

//     });
// });



// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/core/routing/History",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast",
//     "sap/ui/model/json/JSONModel",
//     "sap/ui/core/BusyIndicator",
//     "sap/ui/core/Fragment" // [1] Added Fragment Dependency
// ], function (
//     Controller,
//     History,
//     MessageBox,
//     MessageToast,
//     JSONModel,
//     BusyIndicator,
//     Fragment
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

//             this.getView().setModel(new JSONModel({
//                 isEditable: false
//             }), "viewModel");

//             this._oModifiedPaths = new Set();
//         },

//         _onObjectMatched: function (oEvent) {
//             var sPO = oEvent.getParameter("arguments").PurchaseOrder;

//             this.getView().bindElement({
//                 path: "/zi_p2p_PO_HEAD('" + sPO + "')"
//             });

//             this._oModifiedPaths.clear();
//             this.getView().getModel("viewModel").setProperty("/isEditable", false);
//         },

//         /* =========================================================== */
//         /* POPOVER / SUB-ITEM LOGIC (New)                              */
//         /* =========================================================== */

//         onShowGatePass: function (oEvent) {
//             var oView = this.getView();
//             var oSource = oEvent.getSource(); // The clicked row
//             var oCtx = oSource.getBindingContext();

//             // 1. Load Fragment if not created yet
//             if (!this._pPopover) {
//                 this._pPopover = Fragment.load({
//                     id: oView.getId(),
//                     name: "purchaseorder.poorder.view.GatePassPopover", // Ensure this path matches your folder structure
//                     controller: this
//                 }).then(function (oPopover) {
//                     oView.addDependent(oPopover);
//                     return oPopover;
//                 });
//             }

//             this._pPopover.then(function (oPopover) {
//                 // 2. Open the Popover next to the clicked row
//                 oPopover.openBy(oSource);

//                 // 3. Fetch Data for this specific Item
//                 this._fetchGatePassData(oCtx, oPopover);
//             }.bind(this));
//         },

//         _fetchGatePassData: function (oCtx, oPopover) {
//             var sPath = oCtx.getPath(); // e.g. /zi_p2p_PO_Item(...)
//             var sNavPath = sPath + "/to_Gatepass_item_info"; 
            
//             // Get the table inside the fragment to set it busy
//             var oTable = this.byId("popoverTable"); 
//             if(oTable) oTable.setBusy(true);

//             // Use the main OData model to read
//             var oModel = this.getOwnerComponent().getModel();
            
//             oModel.read(sNavPath, {
//                 success: function(oData) {
//                     // Create a local JSON Model for the Popover
//                     var oLocalModel = new JSONModel(oData);
//                     oPopover.setModel(oLocalModel, "GatePassModel");
//                     if(oTable) oTable.setBusy(false);
//                 },
//                 error: function(oError) {
//                     console.error("Error fetching gate pass data", oError);
//                     if(oTable) oTable.setBusy(false);
//                     // Optional: Clear table if error
//                     oPopover.setModel(new JSONModel({ results: [] }), "GatePassModel");
//                 }
//             });
//         },

//         onCloseGatePass: function () {
//             this._pPopover.then(function(oPopover){
//                 oPopover.close();
//             });
//         },

//         /* =========================================================== */
//         /* Edit / Cancel                                               */
//         /* =========================================================== */

//         onEditPress: function () {
//             var oVM = this.getView().getModel("viewModel");
//             if (!oVM.getProperty("/isEditable")) {
//                 oVM.setProperty("/isEditable", true);
//                 MessageToast.show("Edit mode enabled.");
//             }
//         },

//         onCancelPress: function () {
//             var oModel = this.getView().getModel();

//             if (oModel.hasPendingChanges()) {
//                 oModel.resetChanges();
//             }

//             this._oModifiedPaths.clear();
//             this.getView().getModel("viewModel").setProperty("/isEditable", false);
//             MessageToast.show("Changes discarded.");
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
//             var fGateQty = Number(oInput.getValue()) || 0;

//             this.getView().getModel()
//                 .setProperty(sPath + "/GateReceivedQuantity", String(fGateQty));

//             this._oModifiedPaths.add(sPath);
//         },

//         /* =========================================================== */
//         /* Push Flow                                                   */
//         /* =========================================================== */

//         onPushData: function () {
//             if (this._oModifiedPaths.size === 0) {
//                 MessageBox.information("No changes detected.");
//                 return;
//             }

//             MessageBox.confirm("Do you want to push the changes?", {
//                 title: "Confirm Push",
//                 emphasizedAction: MessageBox.Action.OK,
//                 actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
//                 onClose: function (sAction) {
//                     if (sAction === MessageBox.Action.OK) {
//                         this._executePush();
//                     }
//                 }.bind(this)
//             });
//         },

//         _executePush: function () {
//             var oView = this.getView();
//             var oModel = oView.getModel();
//             var oVM = oView.getModel("viewModel");

//             var oHeaderCtx = oView.getBindingContext();
//             if (!oHeaderCtx) {
//                 MessageBox.error("Header data not available.");
//                 return;
//             }

//             // 🔹 FULL HEADER OBJECT
//             var oHeader = Object.assign({}, oHeaderCtx.getObject());

//             var oTable = oView.byId("itemsTable");
//             var aContexts = oTable.getBinding("items").getContexts();

//             var aItems = [];

//             aContexts.forEach(function (oCtx) {

//                 // Take FULL ITEM OBJECT
//                 var oItem = Object.assign({}, oCtx.getObject());

//                 // Only push modified rows
//                 if (this._oModifiedPaths.has(oCtx.getPath())) {

//                     // 🔹 Override only editable fields
//                     oItem.GateReceivedQuantity = String(oItem.GateReceivedQuantity);
//                     oItem.drivername = oItem.drivername || "";
//                     oItem.mobile = oItem.mobile || "";
//                     oItem.vehiclenumber = oItem.vehiclenumber || "";
//                     oItem.comments = oItem.comments || "";
//                     oItem.InvoiceNumber = oItem.InvoiceNumber || "";
//                     oItem.InvoiceDate = oItem.InvoiceDate || null;
//                     oItem.received = oItem.received === true;

//                     aItems.push(oItem);
//                 }
//             }.bind(this));

//             // 🔹 Attach full items to full header
//             oHeader.to_PurchaseOrderItem = aItems;

//             BusyIndicator.show(0);

//             oModel.create("/zi_p2p_PO_HEAD", oHeader, {
//                 success: function () {
//                     BusyIndicator.hide();
//                     MessageBox.success("Data pushed successfully.");

//                     this._oModifiedPaths.clear();
//                     oVM.setProperty("/isEditable", false);

//                     oView.getElementBinding().refresh(true);
//                     oTable.getBinding("items").refresh(true);
//                 }.bind(this),

//                 error: function (oError) {
//                     BusyIndicator.hide();

//                     var sMsg = "Push failed.";
//                     try {
//                         sMsg = JSON.parse(oError.responseText).error.message.value;
//                     } catch (e) {}

//                     MessageBox.error(sMsg);
//                 }
//             });
//         },


//         /* =========================================================== */
//         /* Navigation (Back Only)                                      */
//         /* =========================================================== */

//         onNavBack: function () {
//             var sPrev = History.getInstance().getPreviousHash();
//             if (sPrev !== undefined) {
//                 window.history.go(-1);
//             } else {
//                 this.getOwnerComponent().getRouter()
//                     .navTo("RouteList", {}, true);
//             }
//         }

//     });
// });




/* =========================================================== */
/*           VERSION 4                                         */
/* =========================================================== */



sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment"
], function (
    Controller,
    History,
    MessageBox,
    MessageToast,
    JSONModel,
    BusyIndicator,
    Fragment
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
                isEditable: false,
                totalItems: 0 // Initialize total items
            }), "viewModel");

            this._oModifiedPaths = new Set();
        },

        _onObjectMatched: function (oEvent) {
            var sPO = oEvent.getParameter("arguments").PurchaseOrder;

            this.getView().bindElement({
                path: "/zi_p2p_PO_HEAD('" + sPO + "')",
                parameters: {
                    expand: "to_PurchaseOrderItem" // Ensure items are expanded
                }
            });

            this._oModifiedPaths.clear();
            this.getView().getModel("viewModel").setProperty("/isEditable", false);
        },

        /* =========================================================== */
        /* NEW FUNCTION: Table Update Finished (Counts Items)          */
        /* =========================================================== */
        onTableUpdateFinished: function(oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            this.getView().getModel("viewModel").setProperty("/totalItems", iTotalItems);
        },

        /* =========================================================== */
        /* POPOVER / SUB-ITEM LOGIC                                    */
        /* =========================================================== */

        onShowGatePass: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource(); // The clicked row
            var oCtx = oSource.getBindingContext();

            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "purchaseorder.poorder.view.GatePassPopover",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }

            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oSource);
                this._fetchGatePassData(oCtx, oPopover);
            }.bind(this));
        },

        _fetchGatePassData: function (oCtx, oPopover) {
            var sPath = oCtx.getPath();
            var sNavPath = sPath + "/to_Gatepass_item_info";

            var oTable = this.byId("popoverTable");
            if (oTable) oTable.setBusy(true);

            var oModel = this.getOwnerComponent().getModel();

            oModel.read(sNavPath, {
                success: function (oData) {
                    var oLocalModel = new JSONModel(oData);
                    oPopover.setModel(oLocalModel, "GatePassModel");
                    if (oTable) oTable.setBusy(false);
                },
                error: function (oError) {
                    console.error("Error fetching gate pass data", oError);
                    if (oTable) oTable.setBusy(false);
                    oPopover.setModel(new JSONModel({ results: [] }), "GatePassModel");
                }
            });
        },

        onCloseGatePass: function () {
            this._pPopover.then(function (oPopover) {
                oPopover.close();
            });
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
            if (!oCtx) { return; }

            var sPath = oCtx.getPath();
            var fGateQty = Number(oInput.getValue()) || 0;

            this.getView().getModel()
                .setProperty(sPath + "/GateReceivedQuantity", String(fGateQty));

            this._oModifiedPaths.add(sPath);
        },

        /* =========================================================== */
        /* Push Flow (YOUR EXISTING LOGIC)                             */
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

            var oHeaderCtx = oView.getBindingContext();
            if (!oHeaderCtx) {
                MessageBox.error("Header data not available.");
                return;
            }

            var oHeader = Object.assign({}, oHeaderCtx.getObject());
            var oTable = oView.byId("itemsTable");
            var aContexts = oTable.getBinding("items").getContexts();
            var aItems = [];

            aContexts.forEach(function (oCtx) {
                var oItem = Object.assign({}, oCtx.getObject());
                if (this._oModifiedPaths.has(oCtx.getPath())) {
                    oItem.GateReceivedQuantity = String(oItem.GateReceivedQuantity);
                    oItem.drivername = oItem.drivername || "";
                    oItem.mobile = oItem.mobile || "";
                    oItem.vehiclenumber = oItem.vehiclenumber || "";
                    oItem.comments = oItem.comments || "";
                    oItem.InvoiceNumber = oItem.InvoiceNumber || "";
                    oItem.InvoiceDate = oItem.InvoiceDate || null;
                    oItem.received = oItem.received === true;
                    aItems.push(oItem);
                }
            }.bind(this));

            oHeader.to_PurchaseOrderItem = aItems;

            BusyIndicator.show(0);

            oModel.create("/zi_p2p_PO_HEAD", oHeader, {
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
                    var sMsg = "Push failed.";
                    try {
                        sMsg = JSON.parse(oError.responseText).error.message.value;
                    } catch (e) { }
                    MessageBox.error(sMsg);
                }
            });
        },

        /* =========================================================== */
        /* AUTOMATION FLOW (NEWLY ADDED)                               */
        /* =========================================================== */

        onSendForApproval: function () {
            var oView = this.getView();
            var oContext = oView.getBindingContext();

            // 1. Check if data is loaded
            if (!oContext) {
                MessageBox.error("No Purchase Order selected.");
                return;
            }

            var oHeaderData = oContext.getObject();

            // 2. Gather Item Data from the Table
            var aItemsPayload = [];
            var aTableItems = this.byId("itemsTable").getItems();

            aTableItems.forEach(function (oItem) {
                var oItemCtx = oItem.getBindingContext();
                if (oItemCtx) {
                    var oItemData = oItemCtx.getObject();
                    aItemsPayload.push({
                        "PurchaseOrder": oItemData.PurchaseOrder,
                        "PurchaseOrderItem": oItemData.PurchaseOrderItem,
                        "Product": oItemData.Product,
                        "Plant": oItemData.Plant,
                        "OrderQuantity": oItemData.OrderQuantity ? String(oItemData.OrderQuantity) : "0",
                        "GrQuantity": oItemData.GrQuantity ? String(oItemData.GrQuantity) : "0"
                    });
                }
            });

            // 3. Construct Payload
            var oPayload = {
                "PurchaseOrder": oHeaderData.PurchaseOrder,
                "PurchaseOrderType": oHeaderData.PurchaseOrderType,
                "Supplier": oHeaderData.Supplier,
                "SupplierName": oHeaderData.SupplierName,
                "to_PurchaseOrderItem": aItemsPayload
            };

            // 4. Set your ID here
            var oTriggerData = {
                // >>>>>>> PASTE YOUR COPIED ID BELOW <<<<<<<
                "definitionId": "us10.5bc55799trial.purchaseorderconfirmation.pOApprovalProcess",
                "businessKey": oHeaderData.PurchaseOrder,
                "context": {
                    "inputpayload": oPayload
                }
            };

            // 5. Send via Destination (proxied by xs-app.json)
            var sUrl = this.getOwnerComponent().getManifestObject().resolveUri("") + "spa-api/workflow/rest/v1/workflow-instances";

            BusyIndicator.show(0);

            $.ajax({
                url: sUrl,
                type: "POST",
                data: JSON.stringify(oTriggerData),
                contentType: "application/json",
                success: function (data) {
                    BusyIndicator.hide();
                    MessageBox.success("Approval process started successfully!");
                },
                error: function (xhr, status, error) {
                    BusyIndicator.hide();
                    MessageBox.error("Failed to start process: " + xhr.responseText);
                    console.error("Error details:", xhr.responseText);
                }
            });
        },

        /* =========================================================== */
        /* Navigation (Back Only)                                      */
        /* =========================================================== */

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