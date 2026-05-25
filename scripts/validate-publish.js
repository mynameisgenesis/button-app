const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error("✖", msg);
  process.exitCode = 1;
}

function warn(msg) {
  console.warn("⚠", msg);
}

(async function main() {
  const root = path.resolve(__dirname, "..");

  // app.json
  const appJsonPath = path.join(root, "app.json");
  if (!fs.existsSync(appJsonPath)) {
    fail("app.json not found in project root");
    return;
  }

  let appJson;
  try {
    appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
  } catch (e) {
    fail("Could not parse app.json: " + e.message);
    return;
  }

  const expo = appJson.expo || {};
  if (!expo.name) fail("expo.name is missing in app.json");
  if (!expo.slug) fail("expo.slug is missing in app.json");
  if (!expo.version) fail("expo.version is missing in app.json");

  if (!expo.ios || !expo.ios.bundleIdentifier) {
    warn(
      "expo.ios.bundleIdentifier is missing — App Store requires a bundle identifier",
    );
  }

  if (!expo.android || !expo.android.package) {
    warn(
      "expo.android.package is missing — Play Store requires an applicationId (package)",
    );
  }

  // eas.json
  const easPath = path.join(root, "eas.json");
  if (!fs.existsSync(easPath)) {
    warn("eas.json not found — EAS build configuration missing");
  } else {
    try {
      const eas = JSON.parse(fs.readFileSync(easPath, "utf8"));
      if (!eas.build || !eas.submit) {
        warn(
          "eas.json looks incomplete — consider adding `build.production` and `submit.production` configs",
        );
      }
    } catch (e) {
      warn("Could not parse eas.json");
    }
  }

  // assets
  if (expo.icon) {
    const iconPath = path.join(root, expo.icon.replace(/^\.\//, ""));
    if (!fs.existsSync(iconPath)) warn("App icon not found at " + expo.icon);
  }

  // simple credential hint
  console.log(
    "Note: This validation checks config presence only — it does not verify App Store Connect credentials.",
  );

  if (process.exitCode && process.exitCode !== 0) {
    console.error(
      "\nValidation failed. Fix the issues above before publishing.",
    );
    process.exit(process.exitCode);
  }

  console.log("✔ Publish validation passed (config checks).");
})();
