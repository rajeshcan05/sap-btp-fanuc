sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, Filter, FilterOperator, JSONModel) {
    "use strict";

    return Controller.extend("purchaseorder.poorder.controller.List", {

        /* =========================================================== */
        /* Lifecycle                                                   */
        /* =========================================================== */

        onInit: function () {
            // Model for counts
            var oCountModel = new JSONModel({
                poCount: 0,
                companyCount: 0,
                plantCount: 0,
                supplierCount: 0
            });
            this.getView().setModel(oCountModel, "countModel");

            this._loadTotalPoCount();
        },

        /* =========================================================== */
        /* Scroll Actions (NEW)                                        */
        /* =========================================================== */

        onScrollUp: function () {
            var oPage = this.byId("listPage");
            // Scroll to position 0 (top) over 500ms
            oPage.scrollTo(0, 500); 
        },

        onScrollDown: function () {
            var oPage = this.byId("listPage");
            var oScrollDelegate = oPage.getScrollDelegate();
            
            if (oScrollDelegate) {
                // Ensure dimensions are up to date
                oScrollDelegate.refresh(); 
                
                // Get the total height of the content
                var iScrollHeight = oScrollDelegate.getScrollHeight();
                
                // Scroll to the absolute bottom over 500ms
                oPage.scrollTo(iScrollHeight, 500);
            }
        },

        /* =========================================================== */
        /* SAFE TOTAL PO COUNT                                         */
        /* =========================================================== */

        _loadTotalPoCount: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oCountModel = this.getView().getModel("countModel");

            if (!oModel) {
                return; 
            }

            oModel.read("/zi_p2p_PO_HEAD/$count", {
                success: function (iCount) {
                    oCountModel.setProperty("/poCount", iCount);
                },
                error: function () {
                    oCountModel.setProperty("/poCount", 0);
                }
            });
        },

        /* =========================================================== */
        /* Navigation                                                  */
        /* =========================================================== */

        onListItemPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var oCtx = oItem.getBindingContext();
            if (!oCtx) { return; }

            var sPurchaseOrder = oCtx.getProperty("PurchaseOrder");
            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                PurchaseOrder: sPurchaseOrder
            });
        },

        /* =========================================================== */
        /* Search                                                      */
        /* =========================================================== */

        onSearch: function () {
            var sPO = this.byId("searchPO").getValue();
            var sSupplier = this.byId("searchSupplier").getValue();
            var sPlant = this.byId("searchPlant").getValue();
            var sCompCode = this.byId("searchCompCode").getValue();

            var aFilters = [];

            if (sPO) {
                aFilters.push(new Filter("PurchaseOrder", FilterOperator.Contains, sPO));
            }
            if (sSupplier) {
                aFilters.push(new Filter("Supplier", FilterOperator.Contains, sSupplier));
            }
            if (sPlant) {
                aFilters.push(new Filter("Plant", FilterOperator.EQ, sPlant));
            }
            if (sCompCode) {
                aFilters.push(new Filter("CompanyCode", FilterOperator.EQ, sCompCode));
            }

            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        /* =========================================================== */
        /* Loaded-data counts                                          */
        /* =========================================================== */

        onUpdateFinished: function () {
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
            if (!oBinding) { return; }

            var aContexts = oBinding.getCurrentContexts();
            var companySet = new Set();
            var plantSet = new Set();
            var supplierSet = new Set();

            aContexts.forEach(function (oCtx) {
                var o = oCtx.getObject();
                if (!o) { return; }

                companySet.add(o.CompanyCode);
                plantSet.add(o.Plant);
                supplierSet.add(o.Supplier);
            });

            var oCountModel = this.getView().getModel("countModel");
            oCountModel.setProperty("/companyCount", companySet.size);
            oCountModel.setProperty("/plantCount", plantSet.size);
            oCountModel.setProperty("/supplierCount", supplierSet.size);
        }

    });
});