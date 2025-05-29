import QRCode from 'react-qr-code';
import './QrWithImage.css'; // Стили для позиционирования

export const QrWithImage = ({ value, imageUrl }: { value: string; imageUrl: string }) => {
  return (
    <div className="qr-container">
      <QRCode
        value={value}
        size={170} // Размер QR-кода (как в вашем макете)
        bgColor="#ffffff"
        fgColor="#000000"
        level="Q" // Уровень коррекции ошибок (L, M, Q, H)
      />
      {imageUrl && (
        <div className="qr-image-overlay">
          <img src={imageUrl} alt="Logo" className="qr-logo" />
        </div>
      )}
    </div>
  );
};
.qr-container {
  position: relative;
  display: inline-block;
}

.qr-image-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 5px;
  border-radius: 4px;
}

.qr-logo {
  width: 40px;  /* Размер логотипа */
  height: 40px;
  object-fit: contain;
}
