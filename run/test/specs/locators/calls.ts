import { LocatorsInterface } from '.';

export class CallButton extends LocatorsInterface {
  public build() {
    return {
      strategy: 'accessibility id',
      selector: 'Call',
    } as const;
  }
}

export class EndCallButton extends LocatorsInterface {
  public build() {
    switch (this.platform) {
      case 'android':
        return {
          strategy: 'id',
          selector: 'network.loki.messenger:id/endCallButton',
        } as const;
      case 'ios':
        return {
          strategy: 'accessibility id',
          selector: 'End call button',
        } as const;
    }
  }
}

export class MissedCallMessage extends LocatorsInterface {
  public build() {
    switch (this.platform) {
      case 'android':
        return {
          strategy: 'id',
          selector: 'network.loki.messenger:id/call_text_view',
        } as const;
      case 'ios':
        return {
          strategy: 'accessibility id',
          selector: 'Missed call',
        } as const;
    }
  }
}
