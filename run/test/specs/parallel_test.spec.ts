import { iosIt } from "../../types/sessionIt";
import { runOnlyOnAndroid, runOnlyOnIOS, sleepFor } from "./utils";
import { newUser } from "./utils/create_account";
import { newContact } from "./utils/create_contact";
import { linkedDevice } from "./utils/link_device";
import {
  SupportedPlatformsType,
  closeApp,
  openAppMultipleDevices,
} from "./utils/open_app";

describe("Parallel tests ios", () => {
  iosIt("Create contact parallel", createContact);
  iosIt("Change username parallel", changeUsername);
});

async function createContact(platform: SupportedPlatformsType) {
  const workerId = parseInt(process.env.MOCHA_WORKER_ID || "0", 10);
  const [device1, device2, device3] = await openAppMultipleDevices(
    platform,
    3,
    workerId
  );
  const userA = await linkedDevice(device1, device3, "Alice", platform);
  console.warn("process.env.MOCHA_WORKER_ID:", process.env.MOCHA_WORKER_ID);
  console.log(
    "Devices for createContact:",
    device1.udid,
    device2.udid,
    device3.udid
  );
  const userB = await newUser(device2, "Bob", platform);

  await newContact(platform, device1, userA, device2, userB);
  await device1.navigateBack(platform);
  // Check username has changed from session id on both device 1 and 3
  await Promise.all([
    device1.waitForTextElementToBePresent({
      strategy: "accessibility id",
      selector: "Conversation list item",
      text: userB.userName,
    }),
    device3.waitForTextElementToBePresent({
      strategy: "accessibility id",
      selector: "Conversation list item",
      text: userB.userName,
    }),
  ]);
  // Check contact is added to contacts list on device 1 and 3 (linked device)
  // await Promise.all([
  //   device1.clickOnElementAll({
  //     strategy: "accessibility id",
  //     selector: "New conversation button",
  //   }),
  //   device3.clickOnElementAll({
  //     strategy: "accessibility id",
  //     selector: "New conversation button",
  //   }),
  // ]);

  // NEED CONTACT ACCESSIBILITY ID TO BE ADDED
  // await Promise.all([
  //   device1.waitForTextElementToBePresent({
  //     strategy: "accessibility id",
  //     selector: "Contacts",
  //   }),
  //   device3.waitForTextElementToBePresent({
  //     strategy: "accessibility id",
  //     selector: "Contacts",
  //   }),
  // ]);

  // Wait for tick
  await closeApp(device1, device2, device3);
}
async function changeUsername(platform: SupportedPlatformsType) {
  const workerId = parseInt(process.env.MOCHA_WORKER_ID || "0", 10);
  const [device1, device2] = await openAppMultipleDevices(
    platform,
    2,
    workerId
  );
  const userA = await linkedDevice(device1, device2, "Alice", platform);
  console.warn("process.env.MOCHA_WORKER_ID:", process.env.MOCHA_WORKER_ID);
  console.log("Devices for changeUsername:", device1.udid, device2.udid);
  const newUsername = "Alice in chains";
  // click on settings/profile avatar
  await device1.clickOnByAccessibilityID("User settings");
  // select username
  await device1.clickOnByAccessibilityID("Username");
  // type in new username
  await sleepFor(100);
  await device1.deleteText("Username");
  await device1.inputText("accessibility id", "Username", newUsername);
  const changedUsername = await device1.grabTextFromAccessibilityId("Username");
  console.log("Changed username", changedUsername);
  if (changedUsername === newUsername) {
    console.log("Username change successful");
  }
  if (changedUsername === userA.userName) {
    console.log("Username is still ", userA.userName);
  }
  if (changedUsername === "Username") {
    console.log(
      "Username is not picking up text but using access id text",
      changedUsername
    );
  } else {
    console.log("Username is not found`");
  }
  // select tick
  await runOnlyOnAndroid(platform, () =>
    device1.clickOnByAccessibilityID("Apply")
  );
  await runOnlyOnIOS(platform, () => device1.clickOnByAccessibilityID("Done"));
  // await device1.navigateBack(platform);
  await runOnlyOnIOS(platform, () =>
    device1.clickOnElementAll({
      strategy: "accessibility id",
      selector: "Close button",
    })
  );
  await Promise.all([
    device1.clickOnElementAll({
      strategy: "accessibility id",
      selector: "User settings",
    }),
    device2.clickOnElementAll({
      strategy: "accessibility id",
      selector: "User settings",
    }),
  ]);

  await Promise.all([
    device1.waitForTextElementToBePresent({
      strategy: "accessibility id",
      selector: "Username",
      text: newUsername,
    }),
    device2.waitForTextElementToBePresent({
      strategy: "accessibility id",
      selector: "Username",
      text: newUsername,
    }),
  ]);
  await closeApp(device1, device2);
}
