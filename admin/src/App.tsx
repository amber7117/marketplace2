import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import thTH from 'antd/locale/th_TH';
import { useGlobalStore } from '@/store';
import router from '@/router';
import '@/locales/i18n';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const { language } = useGlobalStore();

  const antdLocale = {
    en: enUS,
    zh: zhCN,
    th: thTH,
  }[language] || enUS;

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={antdLocale}>
        <Suspense fallback={<Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}>
          <RouterProvider router={router} />
        </Suspense>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
