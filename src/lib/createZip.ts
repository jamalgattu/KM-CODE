function u16(n: number): number[] {
  return [n & 0xff, (n >> 8) & 0xff];
}
function u32(n: number): number[] {
  return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const b of data) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ b) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

export function createZipBlob(files: { name: string; content: string }[]): Blob {
  const enc = new TextEncoder();
  const locals: number[] = [];
  const central: number[] = [];
  let offset = 0;

  for (const f of files) {
    const name = enc.encode(f.name);
    const data = enc.encode(f.content);
    const crc = crc32(data);
    const sz = data.length;

    const local = [
      0x50, 0x4b, 0x03, 0x04,
      0x14, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      ...u32(crc), ...u32(sz), ...u32(sz),
      ...u16(name.length), 0x00, 0x00,
      ...Array.from(name),
    ];
    locals.push(...local, ...Array.from(data));

    central.push(
      0x50, 0x4b, 0x01, 0x02,
      0x14, 0x00, 0x14, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      ...u32(crc), ...u32(sz), ...u32(sz),
      ...u16(name.length), 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      ...u32(offset),
      ...Array.from(name),
    );
    offset += local.length + data.length;
  }

  const cdSize = central.length;
  const end = [
    0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
    ...u16(files.length), ...u16(files.length),
    ...u32(cdSize), ...u32(offset),
    0x00, 0x00,
  ];

  return new Blob([new Uint8Array([...locals, ...central, ...end])], { type: "application/zip" });
}
