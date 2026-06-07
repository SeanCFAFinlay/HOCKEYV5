import childProcess from 'node:child_process';
import { EventEmitter } from 'node:events';

let patched = false;

export function installViteSpawnGuard() {
  if (patched) return;
  patched = true;

  const originalExec = childProcess.exec;

  childProcess.exec = function guardedExec(command, ...args) {
    try {
      return originalExec.call(this, command, ...args);
    } catch (error) {
      if (String(command).trim().toLowerCase() === 'net use') {
        const callback = args.find(arg => typeof arg === 'function');
        const child = new EventEmitter();
        child.stdout = new EventEmitter();
        child.stderr = new EventEmitter();
        child.kill = () => false;

        queueMicrotask(() => {
          if (callback) callback(error, '', '');
          child.emit('error', error);
          child.emit('close', 1);
        });

        return child;
      }

      throw error;
    }
  };
}
