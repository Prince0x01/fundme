import { isLocalSnap } from './snap';

export const shouldDisplayReconnectButton = (installedSnap) =>
  installedSnap && isLocalSnap(installedSnap?.id);
