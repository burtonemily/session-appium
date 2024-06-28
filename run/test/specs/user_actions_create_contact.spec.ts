import { bothPlatformsIt } from "../../types/sessionIt";
import { newUser } from "./utils/create_account";
import { newContact } from "./utils/create_contact";
import { linkedDevice } from "./utils/link_device";
import {
  SupportedPlatformsType,
  closeApp,
  openAppMultipleDevices,
} from "./utils/open_app";

bothPlatformsIt("Create contact ios", createContact);

async function createContact(platform: SupportedPlatformsType) {
  // first we want to install the app on each device with our custom call to run it
  // const testEnv = await createBasicTestEnvironment(platform);
  // const [device1, device3] = testEnv.devices;
  // const userB = testEnv.Bob;
  const workerId = parseInt(process.env.MOCHA_WORKER_ID || "0", 10);
  const [device1, device2, device3] = await openAppMultipleDevices(
    platform,
    3,
    workerId
  );
  const userA = await linkedDevice(device1, device3, "Alice", platform);
  console.warn("process.env.MOCHA_WORKER_ID:", process.env.MOCHA_WORKER_ID);
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
