import * as React from "react";
import { createContext, useCallback, useContext } from "react";
import { Platform } from "react-native";

const APP_GROUP_ID = "group.com.dailywhispers.app";

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (Platform.OS !== "ios") return;

    // Dynamically import to avoid loading native module on Android
    import("@bacons/apple-targets").then(({ ExtensionStorage }) => {
      console.log("[WidgetProvider] Initializing ExtensionStorage with group:", APP_GROUP_ID);
      try {
        new ExtensionStorage(APP_GROUP_ID);
        ExtensionStorage.reloadWidget();
        console.log("[WidgetProvider] Widget reloaded on mount");
      } catch (e) {
        console.warn("[WidgetProvider] Failed to initialize widget storage:", e);
      }
    });
  }, []);

  const refreshWidget = useCallback(() => {
    if (Platform.OS !== "ios") {
      console.log("[WidgetProvider] refreshWidget called on non-iOS platform, skipping");
      return;
    }
    console.log("[WidgetProvider] refreshWidget called");
    import("@bacons/apple-targets").then(({ ExtensionStorage }) => {
      try {
        ExtensionStorage.reloadWidget();
        console.log("[WidgetProvider] Widget reloaded");
      } catch (e) {
        console.warn("[WidgetProvider] Failed to reload widget:", e);
      }
    });
  }, []);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
