// The public Luna bus, through PalmServiceBridge. Every call resolves; a
// denied or silent service resolves to an error-shaped object so callers
// never hang. Bridges are held until they answer so the GC can't collect them.

type Json = Record<string, unknown>;

declare class PalmServiceBridge {
  onservicecallback: (msg: string) => void;
  call(uri: string, params: string): void;
  cancel(): void;
}

declare global {
  interface Window {
    webOSSystem?: {
      launchParams: string;
      setCursorHidden(hidden: boolean): void;
      platformBack(): void;
      activate(): void;
    };
  }
}

const live = new Set<PalmServiceBridge>();

export function luna<T extends Json = Json>(uri: string, params: Json = {}, ms = 4000): Promise<T> {
  const fail = (errorText: string) => ({ returnValue: false, errorText } as unknown as T);
  return new Promise((resolve) => {
    if (typeof PalmServiceBridge === 'undefined') {
      resolve(fail('no bridge (desktop)'));
      return;
    }
    const bridge = new PalmServiceBridge();
    live.add(bridge);
    const done = (value: T) => { live.delete(bridge); clearTimeout(timer); resolve(value); };
    const timer = setTimeout(() => done(fail('timeout')), ms);
    bridge.onservicecallback = (msg) => {
      try { done(JSON.parse(msg) as T); } catch { done(fail('bad json')); }
    };
    try { bridge.call(uri, JSON.stringify(params)); } catch (e) { done(fail(String(e))); }
  });
}

export const launch = (id: string, params: Json = {}) =>
  luna('luna://com.webos.applicationManager/launch', { id, params });

export const appExists = (appId: string) =>
  luna<{ exist?: boolean }>('luna://com.webos.applicationManager/getAppLoadStatus', { appId }, 3000)
    .then((r) => r.exist === true);

export interface InputDevice {
  id: string; label: string; port: number; appId: string;
  connected: boolean; hdmiPlugIn: boolean; hdmiSignalExist: boolean; activate: boolean;
  subList?: Array<{ id: string; osdName?: string; cecPower?: string; uniqueId?: number }>;
}

export const inputStatus = () =>
  luna<{ devices?: InputDevice[] }>('luna://com.webos.service.eim/getAllInputStatus')
    .then((r) => r.devices ?? []);

export const toast = (message: string) =>
  luna('luna://com.webos.notification/createToast', { message });
