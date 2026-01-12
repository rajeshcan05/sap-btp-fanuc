// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/m/MessageBox",
//     "sap/ui/model/Filter",
//     "sap/ui/model/FilterOperator",
//     "sap/ui/model/json/JSONModel"
// ], function (Controller, MessageBox, Filter, FilterOperator, JSONModel) {
//     "use strict";

//     return Controller.extend("purchaseorder.poorder.controller.List", {

//         /* =========================================================== */
//         /* Lifecycle                                                   */
//         /* =========================================================== */

//         onInit: function () {
//             // Model for counts
//             var oCountModel = new JSONModel({
//                 poCount: 0,
//                 companyCount: 0,
//                 plantCount: 0,
//                 supplierCount: 0
//             });
//             this.getView().setModel(oCountModel, "countModel");

//             this._loadTotalPoCount();
//         },

//         /* =========================================================== */
//         /* Scroll Actions (NEW)                                        */
//         /* =========================================================== */

//         onScrollUp: function () {
//             var oPage = this.byId("listPage");
//             // Scroll to position 0 (top) over 500ms
//             oPage.scrollTo(0, 500); 
//         },

//         onScrollDown: function () {
//             var oPage = this.byId("listPage");
//             var oScrollDelegate = oPage.getScrollDelegate();
            
//             if (oScrollDelegate) {
//                 // Ensure dimensions are up to date
//                 oScrollDelegate.refresh(); 
                
//                 // Get the total height of the content
//                 var iScrollHeight = oScrollDelegate.getScrollHeight();
                
//                 // Scroll to the absolute bottom over 500ms
//                 oPage.scrollTo(iScrollHeight, 500);
//             }
//         },

//         /* =========================================================== */
//         /* SAFE TOTAL PO COUNT                                         */
//         /* =========================================================== */

//         _loadTotalPoCount: function () {
//             var oModel = this.getOwnerComponent().getModel();
//             var oCountModel = this.getView().getModel("countModel");

//             if (!oModel) {
//                 return; 
//             }

//             oModel.read("/zi_p2p_PO_HEAD/$count", {
//                 success: function (iCount) {
//                     oCountModel.setProperty("/poCount", iCount);
//                 },
//                 error: function () {
//                     oCountModel.setProperty("/poCount", 0);
//                 }
//             });
//         },

//         /* =========================================================== */
//         /* Navigation                                                  */
//         /* =========================================================== */

//         onListItemPress: function (oEvent) {
//             var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
//             var oCtx = oItem.getBindingContext();
//             if (!oCtx) { return; }

//             var sPurchaseOrder = oCtx.getProperty("PurchaseOrder");
//             this.getOwnerComponent().getRouter().navTo("RouteDetail", {
//                 PurchaseOrder: sPurchaseOrder
//             });
//         },

//         /* =========================================================== */
//         /* Search                                                      */
//         /* =========================================================== */

//         onSearch: function () {
//             var sPO = this.byId("searchPO").getValue();
//             var sSupplier = this.byId("searchSupplier").getValue();
//             var sPlant = this.byId("searchPlant").getValue();
//             var sCompCode = this.byId("searchCompCode").getValue();

//             var aFilters = [];

//             if (sPO) {
//                 aFilters.push(new Filter("PurchaseOrder", FilterOperator.Contains, sPO));
//             }
//             if (sSupplier) {
//                 aFilters.push(new Filter("Supplier", FilterOperator.Contains, sSupplier));
//             }
//             if (sPlant) {
//                 aFilters.push(new Filter("Plant", FilterOperator.EQ, sPlant));
//             }
//             if (sCompCode) {
//                 aFilters.push(new Filter("CompanyCode", FilterOperator.EQ, sCompCode));
//             }

//             var oTable = this.byId("ordersTable");
//             var oBinding = oTable.getBinding("items");
//             oBinding.filter(aFilters);
//         },

//         /* =========================================================== */
//         /* Loaded-data counts                                          */
//         /* =========================================================== */

//         onUpdateFinished: function () {
//             var oTable = this.byId("ordersTable");
//             var oBinding = oTable.getBinding("items");
//             if (!oBinding) { return; }

//             var aContexts = oBinding.getCurrentContexts();
//             var companySet = new Set();
//             var plantSet = new Set();
//             var supplierSet = new Set();

//             aContexts.forEach(function (oCtx) {
//                 var o = oCtx.getObject();
//                 if (!o) { return; }

//                 companySet.add(o.CompanyCode);
//                 plantSet.add(o.Plant);
//                 supplierSet.add(o.Supplier);
//             });

//             var oCountModel = this.getView().getModel("countModel");
//             oCountModel.setProperty("/companyCount", companySet.size);
//             oCountModel.setProperty("/plantCount", plantSet.size);
//             oCountModel.setProperty("/supplierCount", supplierSet.size);
//         }

//     });
// });




sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/Token" // REQUIRED for MultiInput
], function (Controller, MessageBox, Filter, FilterOperator, JSONModel, Fragment, Token) {
    "use strict";

    return Controller.extend("purchaseorder.poorder.controller.List", {

        /* =========================================================== */
        /* Lifecycle                                                   */
        /* =========================================================== */

        onInit: function () {
            var oCountModel = new JSONModel({
                poCount: 0,
                companyCount: 0,
                plantCount: 0,
                supplierCount: 0
            });
            this.getView().setModel(oCountModel, "countModel");

            this._loadTotalPoCount();

            // === MULTI-INPUT VALIDATOR SETUP ===
            // This allows the user to type anything and press Enter to create a token
            var fnValidator = function (args) {
                var text = args.text;
                return new Token({ key: text, text: text });
            };

            ["searchPO", "searchSupplier", "searchPlant", "searchCompCode"].forEach(function (sId) {
                var oControl = this.byId(sId);
                if (oControl) {
                    oControl.addValidator(fnValidator);
                }
            }.bind(this));
        },

        /* =========================================================== */
        /* Search (Updated for Multiple Records)                       */
        /* =========================================================== */

        onSearch: function () {
            // Helper function to build filters for a MultiInput
            var fnGetMultiFilter = function (sControlId, sDbField) {
                var oControl = this.byId(sControlId);
                if (!oControl) return null;

                var aTokens = oControl.getTokens();
                var sText = oControl.getValue(); // Get any text user typed but didn't press enter for yet
                
                var aFieldFilters = [];

                // 1. Add filters for all Token "bubbles" (Exact Match)
                aTokens.forEach(function (oToken) {
                    aFieldFilters.push(new Filter(sDbField, FilterOperator.EQ, oToken.getKey()));
                });

                // 2. Add filter for typed text (Contains match for flexibility)
                if (sText) {
                    aFieldFilters.push(new Filter(sDbField, FilterOperator.Contains, sText));
                }

                // 3. Combine them with "OR" (e.g., PO is 100 OR 101)
                if (aFieldFilters.length > 0) {
                    return new Filter({ filters: aFieldFilters, and: false });
                }
                return null;

            }.bind(this);

            var aFilters = [];

            // Build filters for each field
            var oPOFilter = fnGetMultiFilter("searchPO", "PurchaseOrder");
            if (oPOFilter) aFilters.push(oPOFilter);

            var oSuppFilter = fnGetMultiFilter("searchSupplier", "Supplier");
            if (oSuppFilter) aFilters.push(oSuppFilter);

            var oPlantFilter = fnGetMultiFilter("searchPlant", "Plant");
            if (oPlantFilter) aFilters.push(oPlantFilter);

            var oCompFilter = fnGetMultiFilter("searchCompCode", "CompanyCode");
            if (oCompFilter) aFilters.push(oCompFilter);

            // Apply to Table
            this.byId("ordersTable").getBinding("items").filter(aFilters);
        },

        /* =========================================================== */
        /* WORKFLOW STATUS & HISTORY LOGIC                             */
        /* =========================================================== */

        onShowWorkflowHistory: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();

            if (!this._pWorkflowPopover) {
                this._pWorkflowPopover = Fragment.load({
                    id: oView.getId(),
                    name: "purchaseorder.poorder.view.WorkflowStatusList",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }

            this._pWorkflowPopover.then(function (oPopover) {
                oPopover.openBy(oSource);
                this._fetchWorkflowInstances();
            }.bind(this));
        },

        onCloseWorkflowHistory: function() {
            this._pWorkflowPopover.then(function(oPopover){ oPopover.close(); });
        },

        onRefreshWorkflowStatus: function() {
            this._fetchWorkflowInstances();
        },

        onFilterWorkflow: function(oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oPopover = this.getView().byId("workflowList").getParent();
            var oModel = oPopover.getModel("workflowModel");
            if(!oModel) return;

            var aAllData = oModel.getProperty("/allData");
            if (sKey === "ALL") {
                oModel.setProperty("/results", aAllData);
            } else {
                var aFiltered = aAllData.filter(function(item) { return item.filterKey === sKey; });
                oModel.setProperty("/results", aFiltered);
            }
        },

        _fetchWorkflowInstances: function () {
            var oView = this.getView();
            var oList = oView.byId("workflowList");
            if(oList) { oList.setBusy(true); }

            var sDefinitionId = "us10.5bc55799trial.purchaseorderconfirmation.pOApprovalProcess";
            var sUrl = this.getOwnerComponent().getManifestObject().resolveUri("") + 
                       "spa-api/workflow/rest/v1/workflow-instances?definitionId=" + sDefinitionId;

            $.ajax({
                url: sUrl,
                type: "GET",
                success: function (oData) {
                    var aProcessed = [];

                    oData.forEach(function(item) {
                        
                        // 1. STATUS MAPPING
                        var sDisplay = "Running";
                        var sState = "None"; 
                        var sKey = "RUNNING";
                        
                        switch(item.status) {
                            case "RUNNING": case "READY": case "RESERVED":
                                sDisplay = "Running"; sState = "Information"; sKey = "RUNNING"; break;
                            case "COMPLETED":
                                sDisplay = "Approved"; sState = "Success"; sKey = "APPROVED"; break;
                            case "CANCELED": case "ERRONEOUS":
                                sDisplay = "Rejected"; sState = "Error"; sKey = "REJECTED"; break;
                        }

                        // 2. TITLE LOGIC
                        var sTitle = "PO Approval Request";
                        if (item.businessKey) {
                            sTitle = "Approve PO " + item.businessKey;
                        } else if (item.subject && !item.subject.startsWith("us10")) {
                            sTitle = item.subject;
                        }

                        // 3. CLEAN UP
                        var sIntro = "Standard Order"; 

                        item.displayTitle = sTitle;
                        item.displayIntro = sIntro;
                        item.displayStatus = sDisplay;
                        item.stateColor = sState;
                        item.filterKey = sKey;

                        aProcessed.push(item);
                    });

                    aProcessed.sort(function(a, b) {
                        return new Date(b.startedAt) - new Date(a.startedAt);
                    });

                    var oWFModel = new JSONModel({ results: aProcessed, allData: aProcessed });
                    
                    if(this._pWorkflowPopover) {
                        this._pWorkflowPopover.then(function(oPop){
                             oPop.setModel(oWFModel, "workflowModel");
                             if(oList) { oList.setBusy(false); }
                        });
                    }
                }.bind(this),
                error: function (err) {
                    if(oList) { oList.setBusy(false); }
                }
            });
        },

        /* =========================================================== */
        /* WORKFLOW DETAIL LOGIC (Show Details on Click)               */
        /* =========================================================== */

        onWorkflowItemPress: function (oEvent) {
            var oSource = oEvent.getSource();
            var oCtx = oSource.getBindingContext("workflowModel");
            var sInstanceId = oCtx.getProperty("id");

            var oView = this.getView();
            if (!this._pDetailDialog) {
                this._pDetailDialog = Fragment.load({
                    id: oView.getId(),
                    name: "purchaseorder.poorder.view.WorkflowDetailDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDetailDialog.then(function (oDialog) {
                oDialog.setBusy(true);
                oDialog.open();

                var sUrl = this.getOwnerComponent().getManifestObject().resolveUri("") + 
                           "spa-api/workflow/rest/v1/workflow-instances/" + sInstanceId + "/context";

                $.ajax({
                    url: sUrl,
                    type: "GET",
                    success: function (oData) {
                        var oPayload = null;
                        if (oData.startEvent && oData.startEvent.inputpayload) {
                            oPayload = oData.startEvent.inputpayload;
                        } else if (oData.context && oData.context.inputpayload) {
                            oPayload = oData.context.inputpayload;
                        } else {
                            oPayload = oData; 
                        }

                        var oContextModel = new JSONModel({ inputpayload: oPayload });
                        oDialog.setModel(oContextModel, "contextModel");
                        oDialog.setBusy(false);
                    },
                    error: function (err) {
                        oDialog.setBusy(false);
                        MessageBox.error("Could not fetch workflow details.");
                    }
                });
            }.bind(this));
        },

        onCloseWorkflowDetail: function () {
            this._pDetailDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        /* =========================================================== */
        /* STANDARD LIST LOGIC (Scroll, Counts)                        */
        /* =========================================================== */

        onScrollUp: function () {
            var oPage = this.byId("listPage");
            oPage.scrollTo(0, 500); 
        },

        onScrollDown: function () {
            var oPage = this.byId("listPage");
            var oScrollDelegate = oPage.getScrollDelegate();
            if (oScrollDelegate) {
                oScrollDelegate.refresh(); 
                var iScrollHeight = oScrollDelegate.getScrollHeight();
                oPage.scrollTo(iScrollHeight, 500);
            }
        },

        _loadTotalPoCount: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oCountModel = this.getView().getModel("countModel");
            if (!oModel) return;

            oModel.read("/zi_p2p_PO_HEAD/$count", {
                success: function (iCount) { oCountModel.setProperty("/poCount", iCount); },
                error: function () { oCountModel.setProperty("/poCount", 0); }
            });
        },

        onListItemPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var oCtx = oItem.getBindingContext();
            if (!oCtx) return;

            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                PurchaseOrder: oCtx.getProperty("PurchaseOrder")
            });
        },

        onUpdateFinished: function () {
            var oBinding = this.byId("ordersTable").getBinding("items");
            if (!oBinding) return;

            var aContexts = oBinding.getCurrentContexts();
            var cSet = new Set(), pSet = new Set(), sSet = new Set();

            aContexts.forEach(function (oCtx) {
                var o = oCtx.getObject();
                if (o) {
                    cSet.add(o.CompanyCode);
                    pSet.add(o.Plant);
                    sSet.add(o.Supplier);
                }
            });

            var oCM = this.getView().getModel("countModel");
            oCM.setProperty("/companyCount", cSet.size);
            oCM.setProperty("/plantCount", pSet.size);
            oCM.setProperty("/supplierCount", sSet.size);
        }

    });
});