import React from 'react';
import QRCode from 'react-qr-code';

const SBOLQRCode = () => {
  const sbolUrl = "https://ссылка-на-сбол-сервис";
  const smartpinkUrl = "https://www.site.com/products/..."; // ваш длинный URL
  
  const handleQRClick = () => {
    // Отправляем событие
    if (window.dataLayer) {
      window.dataLayer.push({
        'event': 'SITE_Corporate_reg.social_contract',
        'action': 'become_ip_or_smz',
        'label': 'smz.go_to_sbol_qr'
      });
    }
    
    // Проверяем, нужно ли перенаправлять на смартпинк
    const shouldRedirectToSmartpink = true; // Здесь ваша логика проверки
    
    if (shouldRedirectToSmartpink) {
      window.location.href = smartpinkUrl;
    } else {
      window.location.href = sbolUrl;
    }
  };

  return (
    <div onClick={handleQRClick} style={{ cursor: 'pointer' }}>
      <QRCode 
        value={sbolUrl}
        size={256}
        level="H"
      />
    </div>
  );
};

export default SBOLQRCode;