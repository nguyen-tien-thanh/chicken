import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayout,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import { useTranslation } from "react-i18next";

import {
  DatabaseOutlined,
  FallOutlined,
  ProductOutlined,
  RiseOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import authProvider from "./providers/auth";
import { dataProvider } from "./providers/data";
import { supabaseClient } from "./providers/supabase-client";

import { ShowRedirectDrawer, ThemedSider } from "./components";
import { Customer } from "./pages/customers";
import { ForgotPassword } from "./pages/forgot_password";
import { InventoryTransaction } from "./pages/inventory_transactions";
import { Login } from "./pages/login";
import { ProductCategory } from "./pages/product_categories";
import { Product } from "./pages/products";
import { Purchase } from "./pages/purchases";
import { Register } from "./pages/register";
import { Sale } from "./pages/sales";
import { Supplier } from "./pages/suppliers";

function App() {
  const { t } = useTranslation();

  const i18nProvider = {
    translate: (key: string, options?: unknown, defaultMessage?: string) => {
      if (typeof options === "string" && defaultMessage === undefined) {
        return String(t(key, { defaultValue: options }));
      }
      const interpolation =
        options && typeof options === "object" && !Array.isArray(options)
          ? (options as Record<string, unknown>)
          : {};
      return String(
        t(key, {
          ...interpolation,
          ...(defaultMessage !== undefined
            ? { defaultValue: defaultMessage }
            : {}),
        })
      );
    },
    changeLocale: () => Promise.resolve(),
    getLocale: () => "vi",
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Refine
              dataProvider={dataProvider}
              liveProvider={liveProvider(supabaseClient)}
              authProvider={authProvider}
              routerProvider={routerProvider}
              notificationProvider={useNotificationProvider}
              i18nProvider={i18nProvider}
              resources={[
                {
                  name: "suppliers",
                  list: "/suppliers",
                  show: "/suppliers/show/:id",
                  meta: { canDelete: true, icon: <ShopOutlined /> },
                },
                {
                  name: "purchases",
                  list: "/purchases",
                  create: "/purchases/create",
                  edit: "/purchases/edit/:id",
                  show: "/purchases/show/:id",
                  meta: { canDelete: true, icon: <FallOutlined /> },
                },
                {
                  name: "customers",
                  list: "/customers",
                  show: "/customers/show/:id",
                  meta: { canDelete: true, icon: <UserOutlined /> },
                },
                {
                  name: "sales",
                  list: "/sales",
                  create: "/sales/create",
                  edit: "/sales/edit/:id",
                  show: "/sales/show/:id",
                  meta: { canDelete: true, icon: <RiseOutlined /> },
                },
                {
                  name: "product_categories",
                  list: "/product_categories",
                  meta: { canDelete: true },
                },
                {
                  name: "products",
                  list: "/products",
                  show: "/products/show/:id",
                  meta: { canDelete: true, icon: <ProductOutlined /> },
                },
                {
                  name: "inventory_transactions",
                  list: "/inventory_transactions",
                  show: "/inventory_transactions/show/:id",
                  meta: { icon: <DatabaseOutlined /> },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "E4hTPi-7vkrZ1-EjwW09",
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-inner"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <ThemedLayout
                        Header={Header}
                        Sider={(props) => <ThemedSider {...props} fixed />}
                      >
                        <Outlet />
                      </ThemedLayout>
                    </Authenticated>
                  }
                >
                  <Route
                    index
                    element={<NavigateToResource resource="suppliers" />}
                  />
                  <Route path="/suppliers">
                    <Route index element={<Supplier.List />} />
                    <Route path="show/:id" element={<Supplier.Show />} />
                  </Route>
                  <Route path="/purchases">
                    <Route index element={<Purchase.List />} />
                    <Route path="create" element={<Purchase.Create />} />
                    <Route path="edit/:id" element={<Purchase.Edit />} />
                    <Route path="show/:id" element={<Purchase.Show />} />
                  </Route>
                  <Route path="/sales">
                    <Route index element={<Sale.List />} />
                    <Route path="create" element={<Sale.Create />} />
                    <Route path="edit/:id" element={<Sale.Edit />} />
                    <Route path="show/:id" element={<Sale.Show />} />
                  </Route>
                  <Route path="/customers">
                    <Route index element={<Customer.List />} />
                    <Route path="show/:id" element={<Customer.Show />} />
                  </Route>
                  <Route path="/products">
                    <Route index element={<Product.List />} />
                    <Route path="show/:id" element={<Product.Show />} />
                  </Route>
                  <Route path="/inventory_transactions">
                    <Route index element={<InventoryTransaction.List />} />
                    <Route
                      path="show/:id"
                      element={<InventoryTransaction.Show />}
                    />
                  </Route>
                  <Route path="/product_categories">
                    <Route index element={<ProductCategory.List />} />
                    <Route
                      path="show/:id"
                      element={
                        <ShowRedirectDrawer listPath="/product_categories" />
                      }
                    />
                  </Route>
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-outer"
                      fallback={<Outlet />}
                    >
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
