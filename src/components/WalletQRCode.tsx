import { QRCodeSVG } from 'qrcode.react';

interface WalletQRCodeProps {
  address: string;
  currency: string;
  size?: number;
}

export const WalletQRCode = ({ address, currency, size = 150 }: WalletQRCodeProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white rounded border border-border">
        <QRCodeSVG
          value={address}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
        Scan to copy {currency} address
      </p>
    </div>
  );
};
