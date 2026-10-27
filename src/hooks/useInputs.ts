import { useEffect, useState } from 'preact/hooks';
import { inputStatus, type InputDevice } from '../lib/luna';

// HDMI inputs from the TV's input manager, polled while the app is visible.
// Each input gets a plain-language state derived from plug, signal and CEC.

export type InputState = 'on' | 'starting' | 'rest' | 'off' | 'unplugged';

export interface InputInfo {
  appId: string;
  label: string;
  state: InputState;
  device?: string;     // CEC name, e.g. "PlayStation 5"
  cecId?: number;      // uniqueId for a wake-by-launch
}

export const STATE_TEXT: Record<InputState, string> = {
  on: 'On', starting: 'Starting', rest: 'Rest mode', off: 'Off', unplugged: 'Not connected',
};

function derive(d: InputDevice): InputInfo {
  const cec = d.subList?.find((s) => s.id === 'SIMPLINK');
  const power = cec?.cecPower;
  let state: InputState;
  if (!d.hdmiPlugIn && !d.connected) state = 'unplugged';
  else if (d.hdmiSignalExist) state = 'on';
  else if (power === 'On') state = 'starting';
  else if (cec) state = 'rest';
  else state = d.hdmiPlugIn ? 'off' : 'unplugged';
  return { appId: d.appId, label: d.label, state, device: cec?.osdName, cecId: cec?.uniqueId };
}

const POLL_MS = 4000;

export function useInputs(delayMs = 600): Record<string, InputInfo> {
  const [inputs, setInputs] = useState<Record<string, InputInfo>>({});
  useEffect(() => {
    let timer = 0;
    let stopped = false;
    const poll = async () => {
      if (document.visibilityState === 'visible') {
        const devices = await inputStatus();
        if (stopped) return;
        if (devices.length) setInputs(Object.fromEntries(devices.map((d) => [d.appId, derive(d)])));
      }
      timer = window.setTimeout(poll, POLL_MS);
    };
    timer = window.setTimeout(poll, delayMs);
    const onVisible = () => { if (document.visibilityState === 'visible') { clearTimeout(timer); poll(); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
  return inputs;
}
