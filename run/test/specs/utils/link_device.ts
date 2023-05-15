import { newUser } from "./create_account";
import { SupportedPlatformsType } from "./open_app";
import { sleepFor,  runOnlyOnIOS } from ".";

import { DeviceWrapper } from "../../../types/DeviceWrapper";

export const linkedDevice = async (
  device1: DeviceWrapper,
  device2: DeviceWrapper,
  userName: string,
  platform: SupportedPlatformsType,
  notifications?: boolean,
) => {
  const user = await newUser(device1, userName, platform, notifications);
  // Log in with recovery seed on device 2

  await device2.clickOnElement("Link a device");
  // Enter recovery phrase into input box
  await device2.inputText(
    "accessibility id",
    "Enter your recovery phrase",
    user.recoveryPhrase
  );
  // Continue with recovery phrase
  await device2.clickOnElement("Continue");

  // TODO DELETE THIS AFTER ANDROID USER CONFIG ****************************
  // if (!noDisplayName) {
  //   await sleepFor(10000);
  //   await device2.clickOnElementById(
  //     "network.loki.messenger:id/snackbar_action"
  //   );
  //   await device2.inputText(
  //     "accessibility id",
  //     "Enter display name",
  //     user.userName
  //   );
  //   await device2.clickOnElement("Continue");
  // }
  // Wait for any notifications to disappear
  await device2.waitForElementToBePresent(
    "accessibility id",
    "Message Notifications",
    10000
  );
  // Wait for transitiion animation between the two pages
  await await sleepFor(250);
  // Click continue on message notification settings
  await device2.clickOnElement("Continue with settings");
  // Dismiss notifications alert
  // Check for recovery phrase reminder
  await runOnlyOnIOS(platform, () => device2.clickOnElement("Don’t Allow"));
  await sleepFor(1000);
  await device2.hasElementBeenDeleted("accessibility id", "Continue");
  await sleepFor(1000);
  // Check that button was clicked
  await device2.waitForElementToBePresent(
    "accessibility id",
    "New conversation button"
  );

  if (platform === "android" && notifications === true) {
    await device2.clickOnElement("User settings");
    await device2.clickOnElement("Notifications");
    await sleepFor(1000);
    await device2.clickOnTextElementById(
      "network.loki.messenger:id/device_settings_text",
      "Go to device notification settings"
    );
    await device2.clickOnElementById("android:id/switch_widget");
    await device2.navigateBack(platform);
    await sleepFor(100);
    await device2.navigateBack(platform);
    await sleepFor(100);
    await device2.navigateBack(platform);
  }
  console.warn("Device 3 linked");

  return user;
};
