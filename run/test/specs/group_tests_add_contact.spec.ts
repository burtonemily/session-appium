import { bothPlatformsIt } from "../../types/sessionIt";
import { runOnlyOnIOS, sleepFor, runOnlyOnAndroid } from "./utils";
import { newUser } from "./utils/create_account";
import { newContact } from "./utils/create_contact";
import { createGroup } from "./utils/create_group";
import {
  SupportedPlatformsType,
  openAppFourDevices,
  closeApp,
} from "./utils/open_app";

bothPlatformsIt("Add contact to group", addContactToGroup);

async function addContactToGroup(platform: SupportedPlatformsType) {
  const { device1, device2, device3, device4 } = await openAppFourDevices(
    platform
  );
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  const testGroupName = "Group to test adding contact";
  const group = await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  const userD = await newUser(device4, "Dracula", platform);
  await device1.navigateBack(platform);
  await newContact(platform, device1, userA, device4, userD);
  // Exit to conversation list
  await device1.navigateBack(platform);
  // Select group conversation in list
  await device1.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Conversation list item",
    text: group.userName,
  });
  // Click more options
  await device1.clickOnByAccessibilityID("More options");
  // Select edit group
  await runOnlyOnIOS(platform, () =>
    device1.clickOnByAccessibilityID("Edit group")
  );
  await sleepFor(1000);
  await runOnlyOnAndroid(platform, () =>
    device1.clickOnTextElementById(
      `network.loki.messenger:id/title`,
      "Edit group"
    )
  );
  // Add contact to group
  await device1.clickOnByAccessibilityID("Add members");
  // Select new user
  const addedContact = await device1.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Contact",
    text: userD.userName,
  });
  if (!addedContact && platform === "android") {
    await device1.navigateBack(platform);
    await device1.clickOnByAccessibilityID("Add members");
    await device1.selectByText("Contact", userD.userName);
  }
  // Click done/apply
  await device1.clickOnByAccessibilityID("Done");
  // Click done/apply again
  await sleepFor(1000);
  await runOnlyOnIOS(platform, () =>
    device1.clickOnByAccessibilityID("Apply changes")
  );
  await runOnlyOnAndroid(platform, () =>
    device1.clickOnElementById("network.loki.messenger:id/action_apply")
  );
  // Check config message
  await runOnlyOnIOS(platform, () =>
    device1.waitForControlMessageToBePresent(
      `${userD.userName} joined the group.`
    )
  );
  await runOnlyOnAndroid(platform, () =>
    device1.waitForControlMessageToBePresent(
      `You added ${userD.userName} to the group.`
    )
  );
  // Exit to conversation list
  await device4.navigateBack(platform);
  // Select group conversation in list
  await device4.selectByText("Conversation list item", group.userName);
  // Check config
  await runOnlyOnIOS(platform, () =>
    device4.waitForControlMessageToBePresent(
      `${userD.userName} joined the group.`
    )
  );
  await closeApp(device1, device2, device3, device4);
}
