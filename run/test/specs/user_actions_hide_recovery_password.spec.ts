import { androidIt, iosIt } from '../../types/sessionIt';
import { USERNAME } from '../../types/testing';
import { ContinueButton } from './locators/global';
import {
  HideRecoveryPasswordButton,
  RecoveryPasswordMenuItem,
  UserSettings,
  YesButton,
} from './locators/settings';
import { linkedDevice } from './utils/link_device';
import { closeApp, openAppTwoDevices, SupportedPlatformsType } from './utils/open_app';

iosIt('Hide recovery password', hideRecoveryPassword);
androidIt('Hide recovery password', hideRecoveryPassword);

async function hideRecoveryPassword(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  await linkedDevice(device1, device2, USERNAME.ALICE, platform);
  await device1.clickOnElementAll({ strategy: 'accessibility id', selector: 'User settings' });
  await device1.scrollDown();
  await device1.clickOnElementAll({
    strategy: 'accessibility id',
    selector: 'Recovery password menu item',
  });
  await device1.clickOnElementAll(new HideRecoveryPasswordButton(device1));
  // Wait for modal to appear
  // Check modal is correct
  await device1.checkModalStrings(
    'recoveryPasswordHidePermanently',
    'recoveryPasswordHidePermanentlyDescription1'
  );
  // Click on continue
  await device1.clickOnElementAll(new ContinueButton(device1));
  // Check confirmation modal
  await device1.checkModalStrings(
    'recoveryPasswordHidePermanently',
    'recoveryPasswordHidePermanentlyDescription2'
  );
  // Click on Yes
  await device1.clickOnElementAll(new YesButton(device1));
  // Has recovery password menu item disappeared?
  await device1.doesElementExist({
    ...new RecoveryPasswordMenuItem(device1).build(),
    maxWait: 1000,
  });
  // Should be taken back to Settings page after hiding recovery password
  await device1.waitForTextElementToBePresent({
    strategy: 'accessibility id',
    selector: 'Account ID',
  });
  // Check that linked device still has Recovery Password
  await device2.clickOnElementAll(new UserSettings(device2));
  await device2.scrollDown();
  await device2.waitForTextElementToBePresent(new RecoveryPasswordMenuItem(device2));
  await closeApp(device1, device2);
}
