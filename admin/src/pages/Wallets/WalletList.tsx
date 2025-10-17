import React from 'react';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';

const WalletList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('wallet.title')}</h1>
      <Card>
        <p>Wallet management will be implemented here</p>
      </Card>
    </div>
  );
};

export default WalletList;
