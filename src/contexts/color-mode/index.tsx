import { RefineThemes } from '@refinedev/antd';
import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from 'react';

type ColorModeContextType = {
  mode: string;
  setMode: (mode?: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType,
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const colorModeFromLocalStorage = localStorage.getItem('colorMode');
  const isSystemPreferenceDark = window?.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;

  const systemPreference = isSystemPreferenceDark ? 'dark' : 'light';
  const [mode, setMode] = useState(
    colorModeFromLocalStorage || systemPreference,
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-prefers-color-scheme', mode);
    window.localStorage.setItem('colorMode', mode);
  }, [mode]);

  const setColorMode = (nextMode?: string) => {
    if (nextMode === 'dark' || nextMode === 'light') {
      setMode(nextMode);
      return;
    }

    setMode(current => (current === 'light' ? 'dark' : 'light'));
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        locale={viVN}
        // you can change the theme colors here. example: ...RefineThemes.Magenta,
        theme={{
          ...RefineThemes.Blue,
          algorithm: mode === 'light' ? defaultAlgorithm : darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
