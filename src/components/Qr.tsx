import { useMemo } from 'preact/hooks';
import qrcode from 'qrcode-generator';

export function Qr({ text, size }: { text: string; size: number }) {
  const svg = useMemo(() => {
    const q = qrcode(0, 'M');
    q.addData(text);
    q.make();
    return q.createSvgTag({ cellSize: 1, margin: 0, scalable: true });
  }, [text]);
  return <div class="qr" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
