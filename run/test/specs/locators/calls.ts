import { LocatorsInterface } from '.';

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
