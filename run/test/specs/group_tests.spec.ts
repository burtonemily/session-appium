import { androidIt, iosIt } from "../../types/sessionIt";
import { newUser } from "./utils/create_account";
import { newContact } from "./utils/create_contact";
import { createGroup } from "./utils/create_group";
import { runOnlyOnAndroid, runOnlyOnIOS, sleepFor } from "./utils/index";
import {
  closeApp,
  openAppFourDevices,
  openAppThreeDevices,
  SupportedPlatformsType,
} from "./utils/open_app";

async function groupCreation(platform: SupportedPlatformsType) {
  const testGroupName = "Test group";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create contact between User A and User B and User C
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  // Close server and devices
  await closeApp(device1, device2, device3);
}

async function changeGroupNameAndroid(platform: SupportedPlatformsType) {
  const testGroupName = "Test group";
  const newGroupName = "Changed group name";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create group

  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  // Now change the group name

  // Click on settings or three dots
  await device1.clickOnByAccessibilityID("More options");
  // Click on Edit group option
  await sleepFor(1000);
  await device1.clickOnTextElementById(
    `network.loki.messenger:id/title`,
    "Edit group"
  );

  // Click on current group name
  await device1.clickOnByAccessibilityID("Group name");
  await device1.inputText("accessibility id", "Group name", "   ");
  await device1.clickOnByAccessibilityID("Accept name change");
  // Alert should pop up 'Please enter group name', click ok
  // If ios click ok / If Android go to next step

  await device1.deleteText("Group name");
  // Enter new group name
  await device1.clickOnByAccessibilityID("Group name");

  await device1.inputText("accessibility id", "Group name", newGroupName);
  // Click done/apply
  await device1.clickOnByAccessibilityID("Accept name change");
  await device1.clickOnElementById("network.loki.messenger:id/action_apply");
  // Check config message for changed name (different on ios and android)
  // Config on Android is "You renamed the group to blah"
  await device1.waitForControlMessageToBePresent(
    `You renamed the group to ${newGroupName}`
  );

  await closeApp(device1, device2, device3);
}

async function changeGroupNameIos(platform: SupportedPlatformsType) {
  const testGroupName = "Test group";
  const newGroupName = "Changed group name";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create group

  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  // Now change the group name

  // Click on settings or three dots
  await device1.clickOnByAccessibilityID("More options");
  // Click on Edit group option
  await sleepFor(1000);

  await device1.clickOnByAccessibilityID("Edit group");

  // Click on current group name
  await device1.clickOnByAccessibilityID("Group name");
  await device1.inputText("accessibility id", "Group name text field", "   ");
  await device1.clickOnByAccessibilityID("Accept name change");
  // Alert should pop up 'Please enter group name', click ok
  // If ios click ok / If Android go to next step

  await device1.clickOnByAccessibilityID("OK");
  // Delete empty space
  await device1.clickOnByAccessibilityID("Cancel");

  // Enter new group name
  await device1.clickOnByAccessibilityID("Group name");

  await device1.inputText(
    "accessibility id",
    "Group name text field",
    newGroupName
  );
  // Click done/apply
  await device1.clickOnByAccessibilityID("Accept name change");

  await device1.clickOnByAccessibilityID("Apply changes");
  // If ios click back to match android (which goes back to conversation screen)
  // Check config message for changed name (different on ios and android)
  // Config message on ios is "Title is now blah"
  await device1.waitForControlMessageToBePresent(
    `Title is now '${newGroupName}'.`
  );
  // Config on Android is "You renamed the group to blah"

  await closeApp(device1, device2, device3);
}

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
  await device1.selectByText("Conversation list item", group.userName);
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
async function mentionsForGroups(platform: SupportedPlatformsType) {
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  const testGroupName = "Mentions test group";
  // Create contact between User A and User B
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  await device1.mentionContact(platform, userB);
  // Check format on User B's device
  await device2.findMessageWithBody("@You");
  // Bob to Select User C
  await device2.mentionContact(platform, userC);
  // Check Charlies device(3) for correct format
  await device3.findMessageWithBody(`@You`);
  //  Check User A format works
  await device3.mentionContact(platform, userA);
  // Check device 1 that correct format is shown (Alice's device)
  await device1.findMessageWithBody(`@You`);
  // Close app
  await closeApp(device1, device2, device3);
}

async function leaveGroupIos(platform: SupportedPlatformsType) {
  const testGroupName = "Leave group";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);

  // Create group with user A, user B and User C
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  await device3.clickOnByAccessibilityID("More options");
  await sleepFor(1000);
  await device3.clickOnByAccessibilityID("Leave group");
  await device3.clickOnByAccessibilityID("Leave");
  await device3.navigateBack(platform);
  // Check for control message
  await device2.waitForControlMessageToBePresent(
    `${userC.userName} left the group.`
  );
  await device1.waitForControlMessageToBePresent(
    `${userC.userName} left the group.`
  );
  await closeApp(device1, device2, device3);
}
// TO FIX (LEAVE GROUP CONFIRMATION ON DIALOG NOT WORKING)
async function leaveGroupAndroid(platform: SupportedPlatformsType) {
  const testGroupName = "Leave group";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);

  // Create group with user A, user B and User C
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  await device3.clickOnByAccessibilityID("More options");
  await sleepFor(1000);
  await device3.clickOnTextElementById(
    `network.loki.messenger:id/title`,
    "Leave group"
  );
  await device3.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Yes",
  });
  // Check for control message
  await device2.waitForControlMessageToBePresent(
    `${userC.userName} has left the group.`
  );
  await device1.waitForControlMessageToBePresent(
    `${userC.userName} has left the group.`
  );
  await closeApp(device1, device2, device3);
}

describe("Group Testing", () => {
  iosIt("Create group", groupCreation);
  androidIt("Create group", groupCreation);

  iosIt("Change group name", changeGroupNameIos);
  androidIt("Change group name", changeGroupNameAndroid);

  iosIt("Add contact to group", addContactToGroup);
  androidIt("Add contact to group", addContactToGroup);

  iosIt("Test mentions", mentionsForGroups);
  androidIt("Test mentions", mentionsForGroups);

  iosIt("Leave group", leaveGroupIos);
  androidIt("Leave group", leaveGroupAndroid);
});
